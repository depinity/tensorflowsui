module tensorflowsui::Model {
    use tensorflowsui::Graph;
    use tensorflowsui::Tensor::{ Tensor};

    public fun model(inputs: vector<u64>, graph: &Graph::Graph): Tensor {
        // 레이어 검색
        let input_layer = Graph::get_layer(graph, b"input");
        let dense1 = Graph::get_layer(graph, b"dense1");
        let conv1 = Graph::get_layer(graph, b"conv1");
        let output_layer = Graph::get_layer(graph, b"output");

      
        // 필드 접근 함수로 값 가져오기
        let mut x = Graph::apply_layer(
            inputs,
            Graph::get_weights(dense1),
            Graph::get_bias(dense1),
            Graph::get_layer_type(dense1)
        );

        // Dense1 -> Conv1
        x = Graph::apply_layer(
            x,
            Graph::get_weights(conv1),
            Graph::get_bias(conv1),
            Graph::get_layer_type(conv1)
        );

        // Conv1 -> Output
        let output = Graph::apply_layer(
            x,
            Graph::get_weights(output_layer),
            Graph::get_bias(output_layer),
            Graph::get_layer_type(output_layer)
        );


         tensorflowsui::Tensor::create(vector[vector::length(&output)], output)
    }
}
