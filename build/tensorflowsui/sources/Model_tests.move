module tensorflowsui::Model_tests {
    use tensorflowsui::Graph_tests;
    use tensorflowsui::Tensor_test::{ Tensor};

    public fun create_model(graph: &mut Graph_tests::Graph){

        Graph_tests::Input(graph, b"input");
        Graph_tests::Dense(graph, 3,6,b"dense1");
        Graph_tests::Dense(graph, 6,4,b"dense2");
        Graph_tests::Dense(graph, 4,2,b"output");

    }

    public fun run_inference(inputs: vector<u64>, graph: &Graph_tests::Graph): Tensor {

        let dense1 = Graph_tests::get_layer(graph, b"dense1");
        let dense2 = Graph_tests::get_layer(graph, b"dense2");
        let output_layer = Graph_tests::get_layer(graph, b"output");


        std::debug::print(&std::string::utf8(b"dense 1 layer"));
        let mut x = Graph_tests::apply_dense(
            inputs,
            &Graph_tests::get_weights(dense1),
            &Graph_tests::get_bias(dense1),
            Graph_tests::get_output_nodes(dense1),
        );

        std::debug::print(&std::string::utf8(b"dense 2 layer"));
        x = Graph_tests::apply_dense(
             x,
             &Graph_tests::get_weights(dense2),
             &Graph_tests::get_bias(dense2),
             Graph_tests::get_output_nodes(dense2),
        );

        std::debug::print(&std::string::utf8(b"output layer"));
        let output = Graph_tests::apply_dense(
             x,
             &Graph_tests::get_weights(output_layer),
             &Graph_tests::get_bias(output_layer),
             Graph_tests::get_output_nodes(output_layer),
        );

        tensorflowsui::Tensor_test::create(vector[vector::length(&output)], output)

    }
    

}
