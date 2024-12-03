
// module tensorflowsui::core ;

// use sui::event;



// public fun w1(): u64 {
//     1 // 상수 값
// }

// public fun w2(): u64 {
//     2 // 상수 값
// }

// public fun w3(): u64 {
//     3 // 상수 값
// }

// public fun w4(): u64 {
//     4 // 상수 값
// }

// public fun w5(): u64 {
//     5 // 상수 값
// }

// public fun w6(): u64 {
//     6 // 상수 값
// }

// public fun w7(): u64 {
//     7 // 상수 값
// }

// public fun w8(): u64 {
//     8 // 상수 값
// }

// public fun b1(): u64 {
//     1 // 상수 값
// }

// public fun b2(): u64 {
//     2 // 상수 값
// }

// public fun scale(): u64 {
//     10 // 상수 값
// }

// public struct Output1 has copy, drop {
//     o1: u64
// }

// public struct Output2 has copy, drop {
//     o2: u64
// }

// public struct Output3 has copy, drop {
//     o3: u64
// }

// public struct Output4 has copy, drop {
//     o4: u64
// }

// public struct Result has copy, drop {
//     result: u64
// }

// public fun add(a: u64, b: u64, _ctx: &mut TxContext): u64 {
//     return a + b
// }

// public entry fun add2(in1: u64, in2: u64, _ctx: &mut TxContext): u8 {
//     // add(a, b, ctx)
    
//     let o1 = (in1 * w1() + in2 * w3() + b1());
//     let o2 = (in1 * w2() + in2 * w4() + b1());

//     let o3 = (o1 * w5() + o2 * w6() + b2());
//     let o4 = (o1 * w7() + o2 * w8() + b2());

//     let result = o3 + o4;
//     //  + w3() * scale() + w4() * scale() + w5() * scale() + w6() * scale() + w7() * scale() + w8() * scale()) / scale(); // + w2 * scale + w3 * scale + w4 * scale + w5 * scale + w6 * scale + w7 * scale + w8 * scale) scale;

//     event::emit(Output1 { o1 });
//     event::emit(Output2 { o2 });
//     event::emit(Output3 { o3 });
//     event::emit(Output4 { o4 });

//     event::emit(Result { result });

//     let x: u8 = 8;
//     let y: u8 = 8;
//     x + y
// }

