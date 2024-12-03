module tensorflowsui::Inference {
    use tensorflowsui::Tensor::{ Tensor};
    use tensorflowsui::Graph;
    use tensorflowsui::Model;
    use std::debug::print;

    public fun run(input: vector<u64>): Tensor {
        // 1. 그래프 생성
        let mut graph = Graph::create();

        // 2. 레이어 추가 (Input -> Dense1 -> Dense2 -> Output)
        let _input_layer = Graph::Input(&mut graph, b"input");
        let dense1 = Graph::Dense(&mut graph, 3, 6, b"dense1"); // 3 -> 6
        let dense2 = Graph::Dense(&mut graph, 6, 4, b"dense2"); // 6 -> 4
        let output_layer = Graph::Dense(&mut graph, 4, 2, b"output"); // 4 -> 2

        // 3. 추론 실행
        let output_tensor = Model::model(input, &mut graph);

        // 4. 결과 디버깅 및 반환
        std::debug::print(&output_tensor);
        output_tensor



    }

}
