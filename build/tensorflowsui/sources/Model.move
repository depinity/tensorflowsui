module tensorflowsui::Model {
    use tensorflowsui::Graph;
    use tensorflowsui::Tensor::{ SignedFixedTensor};

    public fun create_model_signed_fixed(graph: &mut Graph::SignedFixedGraph, scale: u64) {
        Graph::DenseSignedFixed(graph, 49, 16, b"dense1", scale);
        Graph::DenseSignedFixed(graph, 16, 8, b"dense2", scale);
        Graph::DenseSignedFixed(graph, 8, 10, b"output", scale);
    }



    public fun run_inference_signed_fixed(
        input_tensor: &SignedFixedTensor,
        graph: &Graph::SignedFixedGraph
    ): SignedFixedTensor {
        let dense1 = Graph::get_layer_signed_fixed(graph, b"dense1");
        let dense2 = Graph::get_layer_signed_fixed(graph, b"dense2");
        let output_layer = Graph::get_layer_signed_fixed(graph, b"output");

        // dense1
        let mut x = Graph::apply_dense_signed_fixed_2(
            input_tensor,
            Graph::get_weight_tensor(dense1), 
            Graph::get_bias_tensor(dense1),
            1
        );

        // dense2
        x = Graph::apply_dense_signed_fixed_2(
            &x,
            Graph::get_weight_tensor(dense2),
            Graph::get_bias_tensor(dense2),
            1
        );

        // output
        let out = Graph::apply_dense_signed_fixed_2(
            &x,
            Graph::get_weight_tensor(output_layer),
            Graph::get_bias_tensor(output_layer),
            0
        );

        out
    }

}
