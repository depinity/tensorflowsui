
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


    fun check2(chk_input : vector<u64>) : vector<u64>{
        std::debug::print(&std::string::utf8(b"Check_input:"));
        // std::debug::print(&std::string::utf8(chk_input));

        // std::string::try_utf8(chk_input)
        
        debug::print(&chk_input);

        debug::print(&chk_input.length());

        debug::print(&chk_input[0]);
        debug::print(&chk_input[1]);
        debug::print(&chk_input[2]);

        debug::print_stack_trace();
        chk_input

    }

    fun check(chk_input : vector<u8>) : vector<u8>{

        debug::print(&chk_input);

        debug::print(&chk_input.length());

        debug::print(&chk_input[0]);
        debug::print(&chk_input[1]);
        debug::print(&chk_input[2]);

        debug::print_stack_trace();
        chk_input

    }

    fun run(inputs: vector<u64>): Tensor {
            // public fun run(input: vector<u64>) {
        std::debug::print(&std::string::utf8(b"run inputs:"));
        debug::print(&inputs);

        // debug::print_stack_trace();
        // 1. 그래프 생성
        let mut graph = Graph_tests::create();
        std::debug::print(&std::string::utf8(b"run graph init:"));
        debug::print(&graph);

        // 2. model 
        // let output_tensor = Model::model(input, &mut graph);

        Model_tests::create_model(&mut graph);

        std::debug::print(&std::string::utf8(b"run graph after create model:"));
        debug::print(&graph);



        // 3. weight upload
        std::debug::print(&std::string::utf8(b"before set weights dense1"));
        debug::print(&graph);
        Graph_tests::set_layer_weights(&mut graph, b"dense1", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], vector[1, 1, 1, 1, 1, 1]);
        std::debug::print(&std::string::utf8(b"after set weights dense1"));
        debug::print(&graph);


        Graph_tests::set_layer_weights(&mut graph, b"dense2", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], vector[1, 1, 1, 1]);
        Graph_tests::set_layer_weights(&mut graph, b"output", vector[1, 2, 3, 4, 5, 6, 7, 8], vector[1, 1]);

        // let output_tensor2 = Model::model(input, &mut graph);
        let output_tensor2 = Model_tests::run_inference(inputs, &graph);

        // // 4. 결과 디버깅 및 반환

        let result = get_data(&output_tensor2);
        

        // sample_tensor = Tensor::create
        output_tensor2

        // sui::event::emits(output)



    }


}
