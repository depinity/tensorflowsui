module tensorflowsui::Model_tests {
    use tensorflowsui::Graph_tests;
    use tensorflowsui::Tensor_test::{ SignedFixedTensor};

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
