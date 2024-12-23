module tensorflowsui::Tensor_test {

    use std::string;
    public struct Tensor has drop {
        shape: vector<u64>,    // tensor shape
        data: vector<u64>,     // tenssor data
    }

    public fun get_data(tensor: &Tensor): vector<u64> {
        tensor.data
    }

    public fun get_shape(tensor: &Tensor): vector<u64> {
        tensor.shape
    }

    // 텐서 생성
    public fun create(shape: vector<u64>, data: vector<u64>): Tensor {
        assert!(vector::length(&shape) > 0, 1); // 최소 1차원이어야 함
        Tensor { shape, data }
    }

    public struct SignedFixedTensor has drop {

        shape : vector<u64>,
        magnitude : vector<u64>,
        sign : vector<u64>,
        scale : u64,
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
    // c가 0..255 범위라고 "가정"하거나,
    // 여기서는 '0'..'9'(48..57)만 다루므로
    assert!(c >= 48 && c <= 57, 9999);

    // 이제 if문으로 매핑
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

/// buf 뒤에 data를 순서대로 붙이기
fun append_bytes(buf: &mut vector<u8>, data: &vector<u8>) {
    let len_data = vector::length(data);
    let mut i = 0;
    while (i < len_data) {
        vector::push_back(buf, *vector::borrow(data, i));
        i = i + 1;
    }
}
/// u64 -> 10진수 ASCII 바이트열 (예: 123 -> [51,50,49])
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
        // c는 u64 (48..57), 근데 push_back expects u8
        // => Move에 cast가 없으므로 "c must be in range"
        //    그리고 c는 최대 57, 문제 없으니
        //    아래처럼 수작업 if문으로 매핑하거나 (간단 예시)
        vector::push_back(&mut digits, safe_to_u8(c));
        x = x / 10;
    };

    // 지금 digits는 역순 ex) 123 -> [51,50,49]
    reverse_bytes(&mut digits); // 아래 함수

    digits
}




public fun to_string(tensor: &SignedFixedTensor): vector<u8> {
    let len = vector::length(&tensor.magnitude);

    // 1) 최종 문자열을 담을 바이트 벡터 준비
    let mut bytes = vector::empty<u8>();

    // 앞에 '[' 넣기
    append_bytes(&mut bytes, &b"[");

    let mut i = 0;
    while (i < len) {
        // ----------------------------
        // (1) 부호
        // ----------------------------
        let sgn = *vector::borrow(&tensor.sign, i);
        if (sgn == 1) {
            // 음수면 '-' 추가
            append_bytes(&mut bytes, &b"-");
        };

        // ----------------------------
        // (2) 정수부, 소수부
        // ----------------------------
        let mag = *vector::borrow(&tensor.magnitude, i);
        let divisor = scale_up(1, tensor.scale);
        let integer_val = mag / divisor;   // 예: 1234 -> 12.34
        let fraction_val = mag % divisor;

        // integer_val -> 바이트로
        let int_bytes = u64_to_bytes(integer_val);  // 아래 함수
        append_bytes(&mut bytes, &int_bytes);

        // '.' 추가
        append_bytes(&mut bytes, &b".");

        // fraction_val -> 바이트로
        let frac_bytes = u64_to_bytes(fraction_val);
        append_bytes(&mut bytes, &frac_bytes);

        // 쉼표(", ") 처리
        if (i < len - 1) {
            append_bytes(&mut bytes, &b", ");
        };

        i = i + 1;
    };

    // 닫는 bracket ']'
    append_bytes(&mut bytes, &b"]");

    // 2) 이제 bytes: vector<u8> => string::String
    bytes
}


    //
    // ----------------------------------------------------
    // 8) (입출력 변환) + (디버깅)
    // ----------------------------------------------------
    //
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




}