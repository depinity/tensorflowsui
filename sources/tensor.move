// Copyright (c) OpenGraph, Inc.
// SPDX-License-Identifier: Apache-2.0

/// @title Fully Onchain Neural Network Inference Implementation
module tensorflowsui::tensor {

    use std::string;
    public struct Tensor has drop {
        shape: vector<u64>,    
        data: vector<u64>,     
    }

    public fun get_data(tensor: &Tensor): vector<u64> {
        tensor.data
    }

    public fun create(shape: vector<u64>, data: vector<u64>): Tensor {
        assert!(vector::length(&shape) > 0, 1); // 최소 1차원이어야 함
        Tensor { shape, data }
    }

    public struct SignedFixedTensor has copy, drop, store {

        shape : vector<u64>,
        magnitude : vector<u64>,
        sign : vector<u64>,
        scale : u64,

    }

    public fun get_scale(t: &SignedFixedTensor): u64 {
        t.scale
    }

    public fun get_shape(t: &SignedFixedTensor): vector<u64> {
        t.shape
    }

    public fun get_magnitude(t: &SignedFixedTensor): vector<u64> {
        t.magnitude
    }

    public fun get_sign(t: &SignedFixedTensor): vector<u64> {
        t.sign
    }

    public fun num_elements(shape : &vector<u64>) : u64 {

        let len =  vector::length(shape);
        let mut product = 1;
        let mut i =0;
        while (i < len) {
            product = product * *vector::borrow(shape, i);
            i= i+1;
        };
        product

    }

    public fun create_signed_fixed(shape : vector<u64> , magnitude : vector<u64>, sign : vector<u64>, scale : u64) : SignedFixedTensor {

        let count = num_elements(&shape);
        
        SignedFixedTensor {

            shape,
            magnitude,
            sign,
            scale
        }
    }

    public fun scale_up(value: u64, scale:u64): u64 {

        let mut result = value;
        let mut i = 0;

        while (i < scale) {

            result = result * 10;
            i=i+1;
        };
        result

    }

    fun reverse_bytes(buf: &mut vector<u8>) {
    let mut left = 0;
    let mut right = vector::length(buf);
    if (right == 0) {
        return;
    };
    right = right - 1;

    while (left < right) {
        let tmp_left  = *vector::borrow(buf, left);
        let tmp_right = *vector::borrow(buf, right);

        *vector::borrow_mut(buf, left)  = tmp_right;
        *vector::borrow_mut(buf, right) = tmp_left;

        left  = left + 1;
        right = right - 1;
    };
}

fun safe_to_u8(c: u64): u8 {
    
    assert!(c >= 48 && c <= 57, 9999);

    if (c == 48) { return 48u8; };
    if (c == 49) { return 49u8; };
    if (c == 50) { return 50u8; };
    if (c == 51) { return 51u8; };
    if (c == 52) { return 52u8; };
    if (c == 53) { return 53u8; };
    if (c == 54) { return 54u8; };
    if (c == 55) { return 55u8; };
    if (c == 56) { return 56u8; };
    if (c == 57) { return 57u8; };
    abort 9999
}

fun append_bytes(buf: &mut vector<u8>, data: &vector<u8>) {
    let len_data = vector::length(data);
    let mut i = 0;
    while (i < len_data) {
        vector::push_back(buf, *vector::borrow(data, i));
        i = i + 1;
    }
}

fun u64_to_bytes(num: u64): vector<u8> {
    if (num == 0) {
        // "0" => [48]
        let mut zero_vec = vector::empty<u8>();
        vector::push_back(&mut zero_vec, 48u8); // 48 = '0'
        return zero_vec;
    };

    let mut digits = vector::empty<u8>();
    let mut x = copy num;

    while (x > 0) {
        let d = x % 10;   // 0..9
        let c = 48 + d;   // '0'=48 ~ '9'=57
        vector::push_back(&mut digits, safe_to_u8(c));
        x = x / 10;
    };

    reverse_bytes(&mut digits); // 아래 함수

    digits
}

public fun to_string(tensor: &SignedFixedTensor): vector<u8> {
    let len = vector::length(&tensor.magnitude);

    let mut bytes = vector::empty<u8>();

    append_bytes(&mut bytes, &b"[");

    let mut i = 0;
    while (i < len) {
       
        let sgn = *vector::borrow(&tensor.sign, i);
        if (sgn == 1) {
            
            append_bytes(&mut bytes, &b"-");
        };

        let mag = *vector::borrow(&tensor.magnitude, i);
        let divisor = scale_up(1, tensor.scale);
        let integer_val = mag / divisor;   // ex: 1234 -> 12.34
        let fraction_val = mag % divisor;

        let int_bytes = u64_to_bytes(integer_val);  
        append_bytes(&mut bytes, &int_bytes);
        append_bytes(&mut bytes, &b".");

        let frac_bytes = u64_to_bytes(fraction_val);
        append_bytes(&mut bytes, &frac_bytes);

        if (i < len - 1) {
            append_bytes(&mut bytes, &b", ");
        };

        i = i + 1;
    };

    append_bytes(&mut bytes, &b"]");

    bytes
}

    public fun from_input(
        shape: vector<u64>,
        input_magnitude: vector<u64>,
        input_sign: vector<u64>,
        scale: u64
    ): SignedFixedTensor {
        create_signed_fixed(shape, input_magnitude, input_sign, scale)
    }

    public fun to_input(tensor: &SignedFixedTensor): (vector<u64>, vector<u64>) {
        (tensor.magnitude, tensor.sign)
    }

    public fun debug_print_tensor(tensor: &SignedFixedTensor) {
        let s_str = to_string(tensor);        
        std::debug::print(&std::string::utf8(s_str));
    }

fun signed_add_element(s1: u64, m1: u64, s2: u64, m2: u64): (u64, u64) {
        if (s1 == s2) {
            (s1, m1 + m2)
        } else {
            if (m1 >= m2) {
                (s1, m1 - m2)
            } else {
                (s2, m2 - m1)
            }
        }
    }

public fun add(a: &SignedFixedTensor, b: &SignedFixedTensor): SignedFixedTensor {
        assert!(a.scale == b.scale, 1001);
        let len = vector::length(&a.magnitude);
        assert!(len == vector::length(&b.magnitude), 1002);

        let mut out_mag = vector::empty<u64>();
        let mut out_sign= vector::empty<u64>();

        let mut i = 0;
        while (i < len) {
            let s1 = *vector::borrow(&a.sign, i);
            let m1 = *vector::borrow(&a.magnitude, i);
            let s2 = *vector::borrow(&b.sign, i);
            let m2 = *vector::borrow(&b.magnitude, i);

            let (res_s, res_m) = signed_add_element(s1, m1, s2, m2);
            vector::push_back(&mut out_sign, res_s);
            vector::push_back(&mut out_mag,  res_m);

            i = i + 1;
        };

        create_signed_fixed(copy a.shape, out_mag, out_sign, a.scale)
    }

    public fun subtract(a: &SignedFixedTensor, b: &SignedFixedTensor): SignedFixedTensor {
        assert!(a.scale == b.scale, 1101);

        let len = vector::length(&b.sign);
        let mut flipped_sign = vector::empty<u64>();

        let mut i = 0;
        while (i < len) {
            let sb = *vector::borrow(&b.sign, i);
            let flipped = if (sb == 0) { 1 } else { 0 };
            vector::push_back(&mut flipped_sign, flipped);
            i = i + 1;
        };

        let neg_b = create_signed_fixed(
            copy b.shape,
            b.magnitude,
            flipped_sign,
            b.scale
        );

        add(a, &neg_b)
    }

    public fun multiply(a: &SignedFixedTensor, b: &SignedFixedTensor): SignedFixedTensor {
        assert!(a.scale == b.scale, 1201);
        let s = a.scale;
        let len = vector::length(&a.magnitude);
        assert!(len == vector::length(&b.magnitude), 1202);

        let mut out_mag = vector::empty<u64>();
        let mut out_sign= vector::empty<u64>();

        let mut i = 0;
        while (i < len) {
            let sa = *vector::borrow(&a.sign, i);
            let ma = *vector::borrow(&a.magnitude, i);
            let sb = *vector::borrow(&b.sign, i);
            let mb = *vector::borrow(&b.magnitude, i);

            let mul_sgn = if (sa == sb) { 0 } else { 1 };
            let mul_mag = ma * mb; // => scale=2s

            vector::push_back(&mut out_sign, mul_sgn);
            vector::push_back(&mut out_mag,  mul_mag);

            i = i + 1;
        };

        create_signed_fixed(copy a.shape, out_mag, out_sign, s * 2)
    }
public fun divide(a: &SignedFixedTensor, b: &SignedFixedTensor): SignedFixedTensor {
        assert!(a.scale == b.scale, 1301);
        let s = a.scale;
        let len = vector::length(&a.magnitude);
        let divisor = scale_up(1, s);

        let mut out_mag = vector::empty<u64>();
        let mut out_sign= vector::empty<u64>();

        let mut i = 0;
        while (i < len) {
            let sa = *vector::borrow(&a.sign, i);
            let ma = *vector::borrow(&a.magnitude, i);
            let sb = *vector::borrow(&b.sign, i);
            let mb = *vector::borrow(&b.magnitude, i);

            let div_sgn = if (sa == sb) { 0 } else { 1 };
            assert!(mb != 0, 9999);

            // (ma * 10^s) / mb
            let numerator = ma * divisor;
            let div_mag   = numerator / mb;

            vector::push_back(&mut out_sign, div_sgn);
            vector::push_back(&mut out_mag,  div_mag);
            i = i + 1;
        };

        create_signed_fixed(copy a.shape, out_mag, out_sign, s)
    }

    fun is_a_greater_than_b(a_sign: u64, a_mag: u64,
                            b_sign: u64, b_mag: u64): bool {
        
        if (a_sign == 0 && b_sign == 1) {
            return true
        } else if (a_sign == 1 && b_sign == 0) {
            return false
        };

        if (a_sign == 0 && b_sign == 0) {
            return (a_mag > b_mag)
        };
       
        return (a_mag < b_mag)
    }

    public fun max_value(t: &SignedFixedTensor): SignedFixedTensor {
        let n = vector::length(&t.magnitude);
        assert!(n > 0, 2001);

        let mut max_sgn = *vector::borrow(&t.sign, 0);
        let mut max_mag = *vector::borrow(&t.magnitude, 0);

        let mut i = 1;
        while (i < n) {
            let sgn_i = *vector::borrow(&t.sign, i);
            let mag_i = *vector::borrow(&t.magnitude, i);

            if (is_a_greater_than_b(sgn_i, mag_i, max_sgn, max_mag)) {
                max_sgn = sgn_i;
                max_mag = mag_i;
            };

            i = i + 1;
        };

        let mut out_shape = vector::empty<u64>();
        vector::push_back(&mut out_shape, 1);

        let mut out_mag = vector::empty<u64>();
        let mut out_sign= vector::empty<u64>();

        vector::push_back(&mut out_mag, max_mag);
        vector::push_back(&mut out_sign, max_sgn);

        create_signed_fixed(out_shape, out_mag, out_sign, t.scale)
    }

    public fun argmax(t: &SignedFixedTensor): u64 {
        let n = vector::length(&t.magnitude);
        assert!(n > 0, 2101);

        let mut max_index = 0;
        let mut max_sgn   = *vector::borrow(&t.sign, 0);
        let mut max_mag   = *vector::borrow(&t.magnitude, 0);

        let mut i = 1;
        while (i < n) {
            let sgn_i = *vector::borrow(&t.sign, i);
            let mag_i = *vector::borrow(&t.magnitude, i);

            if (is_a_greater_than_b(sgn_i, mag_i, max_sgn, max_mag)) {
                max_sgn   = sgn_i;
                max_mag   = mag_i;
                max_index = i;
            };

            i = i + 1;
        };
        max_index
    }

}
