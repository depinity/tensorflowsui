
module tensorflowsui::Inference {
    use tensorflowsui::Tensor::{ Tensor, get_data, get_shape};
    use tensorflowsui::Graph;
    use tensorflowsui::Model;

    public fun run(inputs: vector<u64>): Tensor {
    
        // 1. make Graph
        let mut graph = Graph::create();

        // 2. make model 
        // let output_tensor = Model::model(input, &mut graph);

        Model::create_model(&mut graph);

        // 3. weight upload
        Graph::set_layer_weights(&mut graph, b"dense1", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], vector[1, 1, 1, 1, 1, 1]);
        Graph::set_layer_weights(&mut graph, b"dense2", vector[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], vector[1, 1, 1, 1]);
        Graph::set_layer_weights(&mut graph, b"output", vector[1, 2, 3, 4, 5, 6, 7, 8], vector[1, 1]);

        // 4. model inference
        let output_tensor2 = Model::run_inference(inputs, &graph);

        let result = get_data(&output_tensor2);
        
        output_tensor2


    }


}
