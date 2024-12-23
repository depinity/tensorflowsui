
#[test_only]
module tensorflowsui::Inference_tests {
    use tensorflowsui::Tensor::{ Tensor, get_data, get_shape};
    use tensorflowsui::Graph_tests;
    use tensorflowsui::Model_tests;

    use std::debug;
    // use sui::test_utils::print

    #[test]
    fun test_check(){
        use sui::test_scenario;

            let chk_input :vector<u64> = vector[1,2,3];

            run(chk_input);




    }


    fun run(inputs: vector<u64>): Tensor {
        
        std::debug::print(&std::string::utf8(b"run inputs:"));
        debug::print(&inputs);

        // debug::print_stack_trace();
        // 1. graph init
        let mut graph = Graph_tests::create();
        std::debug::print(&std::string::utf8(b"run graph init:"));
        debug::print(&graph);

        // 2. create model
        Model_tests::create_model(&mut graph);

        std::debug::print(&std::string::utf8(b"run graph after create model:"));
        debug::print(&graph);



        // 3. weight upload
        std::debug::print(&std::string::utf8(b"before set weights dense1"));
        debug::print(&graph);
        Graph_tests::set_layer_weights(&mut graph, b"dense1", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], vector[1, 1, 1, 1, 1, 1]);
        std::debug::print(&std::string::utf8(b"after set weights dense1"));
        debug::print(&graph);
        Graph_tests::set_layer_weights(&mut graph, b"dense2", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], vector[1, 1, 1, 1]);
        Graph_tests::set_layer_weights(&mut graph, b"output", vector[1, 2, 3, 4, 5, 6, 7, 8], vector[1, 1]);
        
        
        // 4. model inference
        let output_tensor2 = Model_tests::run_inference(inputs, &graph);

        // 5. debugging
        let result = get_data(&output_tensor2);

        std::debug::print(&std::string::utf8(b"model resuls:"));
        debug::print(&result);
        
        output_tensor2

    }


}
