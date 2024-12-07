module tensorflowsui::Model {
    use tensorflowsui::Graph;
    use tensorflowsui::Tensor::{ Tensor};

    public fun create_model(graph: &mut Graph::Graph){

        Graph::Input(graph, b"input");
        Graph::Dense(graph, 3,6,b"dense1");
        Graph::Dense(graph, 6,4,b"dense2");
        Graph::Dense(graph, 4,2,b"output");

    }

    public fun run_inference(inputs: vector<u64>, graph: &Graph::Graph): Tensor {

        let dense1 = Graph::get_layer(graph, b"dense1");
        let dense2 = Graph::get_layer(graph, b"dense2");
        let output_layer = Graph::get_layer(graph, b"output");


        std::debug::print(&std::string::utf8(b"dense 1 layer"));
        let mut x = Graph::apply_dense(
            inputs,
            &Graph::get_weights(dense1),
            &Graph::get_bias(dense1),
            Graph::get_output_nodes(dense1),
        );

        std::debug::print(&std::string::utf8(b"dense 2 layer"));
        x = Graph::apply_dense(
             x,
             &Graph::get_weights(dense2),
             &Graph::get_bias(dense2),
             Graph::get_output_nodes(dense2),
        );

        std::debug::print(&std::string::utf8(b"output layer"));
        let output = Graph::apply_dense(
             x,
             &Graph::get_weights(output_layer),
             &Graph::get_bias(output_layer),
             Graph::get_output_nodes(output_layer),
        );

        tensorflowsui::Tensor::create(vector[vector::length(&output)], output)

    }
    

}
