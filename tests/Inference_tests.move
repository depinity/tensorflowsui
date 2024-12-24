
#[test_only]
module tensorflowsui::Inference_tests {
    use tensorflowsui::Tensor_test::{ Tensor, SignedFixedTensor, from_input, debug_print_tensor};
    use tensorflowsui::Graph_tests;
    use tensorflowsui::Model_tests;

    use std::debug;
    // use sui::test_utils::print

    // #[test]
    // fun test_check(){
    //     use sui::test_scenario;

    //         let chk_input :vector<u64> = vector[1,2,3];

    //         run(chk_input);




    // }

        /// 1) 테스트 함수: 여기서 (magnitude, sign, scale) 을 직접 넘김
    #[test]
    fun test_check2() {
        // (예) +1.23, -4.56, +7.89  => magnitude=[123,456,789], sign=[0,1,0], scale=2
        let input_mag  = vector[123, 456, 789];
        let input_sign = vector[0,   1,   0];
        let scale = 2;

        run(input_mag, input_sign, scale);
    }

 public fun run(
        input_magnitude: vector<u64>,
        input_sign: vector<u64>,
        scale: u64
    ) {
        // -----------------------------
        // (A) 고정소수점 그래프 생성
        // -----------------------------
        let mut graph_sf = Graph_tests::create_signed_graph();

        // -----------------------------
        // (B) 모델 생성 (dense1, dense2, output)
        //     shape: [3,6], [6,4], [4,2]
        // -----------------------------
        Model_tests::create_model_signed_fixed(&mut graph_sf, scale);

        // -----------------------------
        // (C) 가중치(Weight/Bias) 업로드
        //     여기서 ± 및 소수점(scale=2) 예시를 섞어서 작성
        // -----------------------------
        // 1) dense1 => shape=[3,6], bias=[6]
        // 예) w1_mag, w1_sign 에 임의로 부호 + 값 섞기
        let w1_mag = vector[
            150,234, 99,100, 200,350, // row0
            408,156,123,987, 654,321, // row1
            111,222,333,444, 12, 99   // row2
        ];
        let w1_sign= vector[
            0,   1,   0,  0,   1,   0, 
            1,   0,   0,  0,   1,   0,
            0,   0,   0,  0,   1,   0
        ];
        // => 예: w1_mag[0]=150 + w1_sign[0]=0 => +1.50
        //        w1_mag[1]=234 + w1_sign[1]=1 => -2.34
        //        ... (소수점은 scale=2)
        
        let b1_mag = vector[100,234,99, 50,12,77];
        let b1_sign= vector[0,   1,   0,  0,  0, 0];
        // => +1.00, -2.34, +0.99, +0.50, +0.12, +0.77

        Graph_tests::set_layer_weights_signed_fixed(
            &mut graph_sf,
            b"dense1",
            w1_mag, w1_sign,
            b1_mag, b1_sign,
            3, 6, // in_dim=3, out_dim=6
            scale
        );

        // 2) dense2 => shape=[6,4], bias=[4]
        let w2_mag = vector[
            999,123, 456,78,
            234,555, 777,999,
            101,202, 303,404,
            111,112, 113,114,
            99,  88,  77, 66,
            50,  40,  30, 20
        ];
        // 전부 6*4=24개
        let w2_sign= vector[
            0,1,0,0,  1,0,1,0,
            0,0,1,0,  0,0,1,0,
            1,0,1,1,  0,0,0,0
        ];
        let b2_mag = vector[12,34,56,78];
        let b2_sign= vector[0,1,1,0];
        // => +0.12, -0.34, -0.56, +0.78

        Graph_tests::set_layer_weights_signed_fixed(
            &mut graph_sf,
            b"dense2",
            w2_mag, w2_sign,
            b2_mag, b2_sign,
            6,4,
            scale
        );

        // 3) output => shape=[4,2], bias=[2]
        let w3_mag = vector[120,340, 560,780, 135,975, 111,999];
        let w3_sign= vector[1,0, 0,1,  0,1, 1,0];
        // => scale=2 => -1.20, +3.40, +5.60, -7.80, ...
        
        let b3_mag = vector[11,22];
        let b3_sign= vector[0,1]; // +0.11, -0.22

        Graph_tests::set_layer_weights_signed_fixed(
            &mut graph_sf,
            b"output",
            w3_mag, w3_sign,
            b3_mag, b3_sign,
            4,2,
            scale
        );

        // -----------------------------
        // (D) 입력 텐서 생성
        //     shape=[1,3], magnitude=input_magnitude, sign=input_sign
        // -----------------------------
        let inp_shape = vector[1,3];
        let input_tensor = from_input(inp_shape, input_magnitude, input_sign, scale);

        debug::print(&std::string::utf8(b"[fixed] input tensor: "));
        debug_print_tensor(&input_tensor);

        // -----------------------------
        // (E) 추론
        // -----------------------------
        let result = Model_tests::run_inference_signed_fixed(&input_tensor, &graph_sf);

        // -----------------------------
        // (F) 결과 확인
        // -----------------------------
        debug::print(&std::string::utf8(b"[fixed] output tensor: "));
        debug_print_tensor(&result);
    }


    // fun run(inputs: vector<u64>): Tensor {
        
    //     std::debug::print(&std::string::utf8(b"run inputs:"));
    //     debug::print(&inputs);

    //     // debug::print_stack_trace();
    //     // 1. graph init
    //     let mut graph = Graph_tests::create();
    //     std::debug::print(&std::string::utf8(b"run graph init:"));
    //     debug::print(&graph);

    //     // 2. create model
    //     Model_tests::create_model(&mut graph);

    //     std::debug::print(&std::string::utf8(b"run graph after create model:"));
    //     debug::print(&graph);



    //     // 3. weight upload
    //     std::debug::print(&std::string::utf8(b"before set weights dense1"));
    //     debug::print(&graph);
    //     Graph_tests::set_layer_weights(&mut graph, b"dense1", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], vector[1, 1, 1, 1, 1, 1]);
    //     std::debug::print(&std::string::utf8(b"after set weights dense1"));
    //     debug::print(&graph);
    //     Graph_tests::set_layer_weights(&mut graph, b"dense2", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], vector[1, 1, 1, 1]);
    //     Graph_tests::set_layer_weights(&mut graph, b"output", vector[1, 2, 3, 4, 5, 6, 7, 8], vector[1, 1]);
        
        
    //     // 4. model inference
    //     let output_tensor2 = Model_tests::run_inference(inputs, &graph);

    //     // 5. debugging
    //     let result = get_data(&output_tensor2);

    //     std::debug::print(&std::string::utf8(b"model resuls:"));
    //     debug::print(&result);
        
    //     output_tensor2

    // }


}
