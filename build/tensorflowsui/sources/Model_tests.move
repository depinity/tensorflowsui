module tensorflowsui::Model_tests {
    use tensorflowsui::Graph_tests;
    use tensorflowsui::Tensor_test::{ SignedFixedTensor};

    // public fun create_model(graph: &mut Graph_tests::Graph){

    //     Graph_tests::Input(graph, b"input");
    //     Graph_tests::Dense(graph, 3,6,b"dense1");
    //     Graph_tests::Dense(graph, 6,4,b"dense2");
    //     Graph_tests::Dense(graph, 4,2,b"output");

    // }






    // public fun run_inference(inputs: vector<u64>, graph: &Graph_tests::Graph): Tensor {

    //     let dense1 = Graph_tests::get_layer(graph, b"dense1");
    //     let dense2 = Graph_tests::get_layer(graph, b"dense2");
    //     let output_layer = Graph_tests::get_layer(graph, b"output");


    //     std::debug::print(&std::string::utf8(b"dense 1 layer"));
    //     let mut x = Graph_tests::apply_dense(
    //         inputs,
    //         &Graph_tests::get_weights(dense1),
    //         &Graph_tests::get_bias(dense1),
    //         Graph_tests::get_output_nodes(dense1),
    //     );

    //     std::debug::print(&std::string::utf8(b"dense 2 layer"));
    //     x = Graph_tests::apply_dense(
    //          x,
    //          &Graph_tests::get_weights(dense2),
    //          &Graph_tests::get_bias(dense2),
    //          Graph_tests::get_output_nodes(dense2),
    //     );

    //     std::debug::print(&std::string::utf8(b"output layer"));
    //     let output = Graph_tests::apply_dense(
    //          x,
    //          &Graph_tests::get_weights(output_layer),
    //          &Graph_tests::get_bias(output_layer),
    //          Graph_tests::get_output_nodes(output_layer),
    //     );

    //     tensorflowsui::Tensor_test::create(vector[vector::length(&output)], output)

    // }



    // public fun create_model_signed_fixed(graph: &mut Graph_tests::SignedFixedGraph, scale: u64) {
    //     Graph_tests::DenseSignedFixed(graph, 3, 6, b"dense1", scale);
    //     Graph_tests::DenseSignedFixed(graph, 6, 4, b"dense2", scale);
    //     Graph_tests::DenseSignedFixed(graph, 4, 2, b"output", scale);
    // }


    //     public fun run_inference_signed_fixed(
    //     input_tensor: &SignedFixedTensor,
    //     graph: &Graph_tests::SignedFixedGraph
    // ): SignedFixedTensor {
    //     let dense1 = Graph_tests::get_layer_signed_fixed(graph, b"dense1");
    //     let dense2 = Graph_tests::get_layer_signed_fixed(graph, b"dense2");
    //     let output_layer = Graph_tests::get_layer_signed_fixed(graph, b"output");

    //     // dense1
    //     let mut x = Graph_tests::apply_dense_signed_fixed(
    //         input_tensor,
    //         Graph_tests::get_weight_tensor(dense1), 
    //         Graph_tests::get_bias_tensor(dense1)
    //     );

    //     // dense2
    //     x = Graph_tests::apply_dense_signed_fixed(
    //         &x,
    //         Graph_tests::get_weight_tensor(dense2),
    //         Graph_tests::get_bias_tensor(dense2)
    //     );

    //     // output
    //     let out = Graph_tests::apply_dense_signed_fixed(
    //         &x,
    //         Graph_tests::get_weight_tensor(output_layer),
    //         Graph_tests::get_bias_tensor(output_layer)
    //     );

    //     out
    // }


    public fun create_model_signed_fixed(graph: &mut Graph_tests::SignedFixedGraph, scale: u64) {
        Graph_tests::DenseSignedFixed(graph, 49, 16, b"dense1", scale);
        Graph_tests::DenseSignedFixed(graph, 16, 8, b"dense2", scale);
        Graph_tests::DenseSignedFixed(graph, 8, 10, b"output", scale);
    
    }



    public fun run_inference_signed_fixed(
        input_tensor: &SignedFixedTensor,
        graph: &Graph_tests::SignedFixedGraph
    ): SignedFixedTensor {
        let dense1 = Graph_tests::get_layer_signed_fixed(graph, b"dense1");
        let dense2 = Graph_tests::get_layer_signed_fixed(graph, b"dense2");
        let output_layer = Graph_tests::get_layer_signed_fixed(graph, b"output");

        // dense1
        let mut x = Graph_tests::apply_dense_signed_fixed_3(
            input_tensor,
            Graph_tests::get_weight_tensor(dense1), 
            Graph_tests::get_bias_tensor(dense1),
            1
        );

        // dense2
        x = Graph_tests::apply_dense_signed_fixed_3(
            &x,
            Graph_tests::get_weight_tensor(dense2),
            Graph_tests::get_bias_tensor(dense2),
            1
        );

        // output
        let out = Graph_tests::apply_dense_signed_fixed_3(
            &x,
            Graph_tests::get_weight_tensor(output_layer),
            Graph_tests::get_bias_tensor(output_layer),
            0
        );

        out
    }

}
