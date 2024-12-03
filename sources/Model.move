module tensorflowsui::Model {
    use tensorflowsui::Graph;
    use tensorflowsui::Tensor::{ Tensor};

    public fun model(inputs: vector<u64>, graph: &mut Graph::Graph): Tensor {
        // 레이어 검색
        let input_layer = Graph::Input(graph, b"input");
        let dense1 = Graph::Dense(graph, 3, 6, b"dense1");
        let dense2 = Graph::Dense(graph, 6, 4, b"dense2");
        let output_layer = Graph::Dense(graph, 4, 2, b"output");


 // 레이어 호출을 통한 연산
        let mut x = Graph::apply_dense(
            inputs,
            &Graph::get_weights(&dense1),
            &Graph::get_bias(&dense1),
            Graph::get_output_nodes(&dense1),
        );

        x = Graph::apply_dense(
            x,
            &Graph::get_weights(&dense2),
            &Graph::get_bias(&dense2),
            Graph::get_output_nodes(&dense2),
        );

        let output = Graph::apply_dense(
            x,
            &Graph::get_weights(&output_layer),
            &Graph::get_bias(&output_layer),
            Graph::get_output_nodes(&output_layer),
        );

         tensorflowsui::Tensor::create(vector[vector::length(&output)], output)
    }
}
