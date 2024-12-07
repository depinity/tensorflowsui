module tensorflowsui::Model_tests {
    use tensorflowsui::Graph_tests;
    use tensorflowsui::Tensor::{ Tensor};

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

        let mut x = Graph::apply_dense(
            inputs,
            &Graph::get_weights(dense1),
            &Graph::get_bias(dense1),
            Graph::get_output_nodes(dense1),
        );

        x = Graph::apply_dense(
             x,
             &Graph::get_weights(dense2),
             &Graph::get_bias(dense2),
             Graph::get_output_nodes(dense2),
        );

        let output = Graph::apply_dense(
             x,
             &Graph::get_weights(output_layer),
             &Graph::get_bias(output_layer),
             Graph::get_output_nodes(output_layer),
        );

        tensorflowsui::Tensor::create(vector[vector::length(&output)], output)

    }
    

}
