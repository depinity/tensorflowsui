

module tensorflowsui::Inference {
    use tensorflowsui::Tensor::{ Tensor, SignedFixedTensor, from_input, debug_print_tensor,argmax};
    use tensorflowsui::Graph;
    use tensorflowsui::Model;

    use std::debug;
    use sui::event;

    public struct Result has copy, drop {
        value : u64
    }
    

    fun test_check2() {
         let scale = 2;
        
        // // label 0
        // debug::print(&std::string::utf8(b"true label: 0"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 96, 1, 0, 0, 0, 33, 62, 29, 45, 0, 0, 0, 50, 0, 0, 88, 0, 0, 17, 0, 0, 54, 7, 0, 0, 11, 97, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 1
        // debug::print(&std::string::utf8(b"true label: 1"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 45, 12, 0, 0, 0, 0, 0, 93, 0, 0, 0, 0, 0, 83, 1, 0, 0, 0, 0, 28, 62, 0, 0, 0, 0, 0, 97, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 2
        // debug::print(&std::string::utf8(b"true label: 2"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 71, 0, 0, 0, 0, 77, 65, 61, 0, 0, 0, 0, 1, 72, 92, 0, 0, 0, 14, 54, 66, 31, 73, 0, 0, 55, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 3
        // debug::print(&std::string::utf8(b"true label: 3"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 85, 99, 17, 0, 0, 0, 3, 0, 56, 32, 0, 0, 0, 62, 93, 90, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 90, 76, 94, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 4
        // debug::print(&std::string::utf8(b"true label: 4"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 66, 0, 0, 0, 99, 0, 0, 95, 0, 0, 0, 51, 60, 87, 99, 0, 0, 0, 6, 67, 0, 99, 2, 0, 0, 0, 0, 0, 33, 57, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 5
        // debug::print(&std::string::utf8(b"true label: 5"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0, 0, 0, 0, 53, 25, 0, 0, 0, 0, 25, 33, 6, 0, 0, 0, 8, 0, 45, 0, 0, 0, 0, 28, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 6
        // debug::print(&std::string::utf8(b"true label: 6"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 79, 44, 0, 0, 0, 0, 4, 89, 0, 0, 0, 0, 0, 59, 92, 43, 0, 0, 0, 0, 49, 89, 90, 30, 0, 0, 0, 0, 61, 81, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 7
        // debug::print(&std::string::utf8(b"true label: 7"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 39, 39, 71, 0, 0, 0, 0, 0, 0, 54, 16, 0, 0, 3, 74, 52, 10, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 8
        debug::print(&std::string::utf8(b"true label: 8"));
        let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 44, 30, 37, 0, 0, 0, 50, 3, 89, 0, 0, 0, 0, 0, 99, 5, 0, 0, 0, 0, 63, 5, 46, 0, 0, 0, 0, 97, 85, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 9
        // debug::print(&std::string::utf8(b"true label: 9"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 46, 0, 0, 0, 0, 12, 8, 75, 0, 0, 0, 0, 0, 85, 30, 0, 0, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


        run(input_mag, input_sign, scale);
    }

 entry public fun run(
        input_magnitude: vector<u64>,
        input_sign: vector<u64>,
        scale: u64
    ) {
        // -----------------------------
        // (A) 고정소수점 그래프 생성
        // -----------------------------
        let mut graph_sf = Graph::create_signed_graph();

        // -----------------------------
        // (B) 모델 생성 (dense1, dense2, output)
        //     shape: [3,6], [6,4], [4,2]
        // -----------------------------
        Model::create_model_signed_fixed(&mut graph_sf, scale);

        // -----------------------------
        // (D) 입력 텐서 생성
        //     shape=[1,3], magnitude=input_magnitude, sign=input_sign
        // -----------------------------
        let inp_shape = vector[1,49];
        let input_tensor = from_input(inp_shape, input_magnitude, input_sign, scale);

        debug::print(&std::string::utf8(b"[fixed] input tensor: "));
        debug_print_tensor(&input_tensor);

        // -----------------------------
        // (E) 추론
        // -----------------------------
        let result = Model::run_inference_signed_fixed(&input_tensor, &graph_sf);
        // debug_print_tensor(&result);
        // -----------------------------
        // (F) 결과 확인
        // -----------------------------

        let label = argmax(&result);

        debug::print(&std::string::utf8(b"[fixed] output tensor: "));
        debug_print_tensor(&result);

        debug::print(&std::string::utf8(b"y label: "));
        std::debug::print(&label);

        event::emit(Result { value:label })
    }


}
