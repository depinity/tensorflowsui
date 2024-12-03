module tensorflowsui::Inference {
    use tensorflowsui::Tensor::{ Tensor};
    use tensorflowsui::Graph;
    use tensorflowsui::Model;
    use std::debug::print;

    public fun run(input: vector<u64>): Tensor {
        // 1. 그래프 생성
        let mut graph = Graph::create();

        // 2. model 
        let output_tensor = Model::model(input, &mut graph);

        // 3. weight upload
        Graph::set_layer_weights(&mut graph, b"dense1", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], vector[1, 1, 1, 1, 1, 1]);
        Graph::set_layer_weights(&mut graph, b"dense2", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], vector[1, 1, 1, 1]);
        Graph::set_layer_weights(&mut graph, b"output", vector[1, 2, 3, 4, 5, 6, 7, 8], vector[1, 1]);

        // 4. 결과 디버깅 및 반환
        std::debug::print(&output_tensor);
        output_tensor



    }

}
