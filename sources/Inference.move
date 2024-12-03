module tensorflowsui::Inference {
    use tensorflowsui::Tensor::{ Tensor};
    use tensorflowsui::Graph;
    use tensorflowsui::Model;
    use std::debug::print;

    public fun run(input: vector<u64>): Tensor {
        // 1. 그래프 생성
        let mut graph = Graph::create();

        // 2. 레이어 추가 (Dense, Conv2D 예시)
        Graph::add_layer(&mut graph, b"input", b"dense", vector[1, 1, 1], 0);
        Graph::add_layer(&mut graph, b"dense1", b"dense", vector[7, 4, 6, 5, 6, 8], 1);
        Graph::add_layer(&mut graph, b"conv1", b"conv2d", vector[3, 4, 9], 2);
        Graph::add_layer(&mut graph, b"output", b"dense", vector[1, 1], 0);

        // 3. 가중치 업데이트
        Graph::set_layer_weights(&mut graph, b"dense1", vector[7, 4, 6, 5, 6, 8], 1);
        Graph::set_layer_weights(&mut graph, b"conv1", vector[3, 4, 9], 2);

        // 4. 추론 실행
        let inputs = input; // 입력 텐서
        let output_tensor = Model::model(inputs, &graph);

        std::debug::print(&output_tensor);

        output_tensor



    }

}
