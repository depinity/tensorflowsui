module tensorflowsui::Graph {


    use std::debug;


    public struct Layer has copy, drop {
        name: vector<u8>,          // layer names
        layer_type: vector<u8>,    // layer types (Dense, Conv2D)
        input_nodes : u64,         // # of input nodes
        output_nodes : u64,        // # of output nodes
        weights: vector<u64>,      // layer weights
        bias: vector<u64>,         // layer bias 
    }

    public struct Graph has drop {
        layers: vector<Layer>,     // graph
    }

    public fun get_output_nodes(layer : &Layer) : u64 {

        layer.output_nodes // get nodes
    }

    public fun get_weights(layer: &Layer): vector<u64> {
        layer.weights // get weights
    }

    public fun get_bias(layer: &Layer): vector<u64> {
        layer.bias // get bias
    }

    public fun get_layer_type(layer: &Layer): &vector<u8> {
        &layer.layer_type // get layer type
    }

    public fun get_name(layer: &Layer): &vector<u8> {
        &layer.name // get layer name
    }

    public fun create(): Graph {
        Graph { layers: vector::empty<Layer>() } // graph init
    }

    public fun add_layer(graph: &mut Graph, name: vector<u8>, layer_type: vector<u8>, input_nodes:u64, output_nodes:u64  ) {
        let weights : vector<u64> = initialize_weights(input_nodes, output_nodes);
        let bias : vector<u64> = initialize_bias(output_nodes);
        let layer = Layer { name, layer_type, input_nodes, output_nodes, weights, bias };
        vector::push_back(&mut graph.layers, layer);
    }

    public fun initialize_weights(input_nodes: u64, output_nodes:u64 ) : vector<u64> {
        let mut weights = vector::empty<u64>();
        let mut i = 0;
        while ( i < input_nodes * output_nodes) {
            vector::push_back(&mut weights, 1);
            i = i +1;
        };
        weights
    }

    public fun initialize_bias(output_nodes: u64): vector<u64> {
        let mut bias = vector::empty<u64>();

        // init bias
        let mut i = 0;
        while (i < output_nodes) {
            vector::push_back(&mut bias, 0);
            i = i + 1;
        };

        bias
    }

    public fun ReLu(weighted_sum : u64): u64 {
        if (weighted_sum > 0) {
            weighted_sum
        } else {
            0
        }
    }

    public fun Dense(graph: &mut Graph, input_nodes: u64, output_nodes: u64, name: vector<u8>): Layer {

        let weights = initialize_weights(input_nodes, output_nodes);
        let bias = initialize_bias(output_nodes);

        let layer = Layer {
            name,
            layer_type: b"dense",
            input_nodes,
            output_nodes,
            weights,
            bias,
        };

        vector::push_back(&mut graph.layers, layer);
        layer
    }

    public fun Input(graph: &mut Graph, name: vector<u8>): Layer {
        let layer = Layer {
            name,
            layer_type: b"input",
            input_nodes: 0,
            output_nodes: 0,
            weights: vector::empty<u64>(),
            bias: vector::empty<u64>(),
        };

        vector::push_back(&mut graph.layers, layer);
        layer
    }

    public fun set_layer_weights(graph: &mut Graph, name: vector<u8>, weights: vector<u64>, bias: vector<u64>) {
        let len = vector::length(&graph.layers);
        let mut i = 0;
        while (i < len) {
            let layer = vector::borrow_mut(&mut graph.layers, i);
            if (layer.name == name) {
                layer.weights = weights;
                layer.bias = bias;
                return;
            };
            i = i + 1;
        };
        abort 1; 
    }

    public fun get_layer(graph: &Graph, name: vector<u8>): &Layer {
        let mut i = 0;
        while (i < vector::length(&graph.layers)) {
            let layer = vector::borrow(&graph.layers, i);
            if (layer.name == name) {
                return layer;
            };
            i = i + 1;
        };
        abort 1
    }

    public fun apply_dense(inputs: vector<u64>, weights: &vector<u64>, bias: &vector<u64>, output_nodes: u64): vector<u64> {
    let mut result = vector::empty<u64>();
    let input_size = vector::length(&inputs);
    let max_computation = input_size * output_nodes;

        std::debug::print(&std::string::utf8(b"input vector:"));
        debug::print(&inputs);



        std::debug::print(&std::string::utf8(b"input number:"));
        debug::print(&input_size);
        
        std::debug::print(&std::string::utf8(b"output number:"));
        debug::print(&output_nodes);

        std::debug::print(&std::string::utf8(b"max computation:"));
        debug::print(&max_computation);

        debug::print(weights);
        debug::print(bias);
        
        debug::print(&output_nodes);

    
    // assert!(vector::length(weights) == input_size * output_nodes, 1);
    // assert!(vector::length(bias) == output_nodes, 2);

    
    let mut i = 0;
    while (i < output_nodes) {
        let mut weighted_sum = 0;
        let mut j = 0;

        while (j < input_size) {
            let weight_index = i * (input_size) + j;
           
            std::debug::print(&std::string::utf8(b"i number:"));
            debug::print(&i);

            std::debug::print(&std::string::utf8(b"j number:"));
            debug::print(&j);


            std::debug::print(&std::string::utf8(b"weigth_index:"));
            debug::print(& weight_index);


            weighted_sum = weighted_sum + (inputs[j] * weights[weight_index]);
            j = j + 1;
        };

        weighted_sum = weighted_sum + *vector::borrow(bias, i);
        weighted_sum = ReLu(weighted_sum);
        vector::push_back(&mut result, weighted_sum);
        i = i + 1;
    };

    result
}

    public fun apply_conv2d(prev_output: vector<u64>, weights: &vector<u64>, bias: u64): vector<u64> {
        let mut result = vector::empty<u64>();
        let kernel_size = vector::length(weights);
        let prev_output_size = vector::length(&prev_output);

        let mut i = 0;
        while (i <= prev_output_size - kernel_size) {
            let mut conv_sum = 0;
            let mut j = 0;
            while (j < kernel_size) {
                conv_sum = conv_sum + (prev_output[i + j] * weights[j]);
                j = j + 1;
            };
            conv_sum = conv_sum + bias;
            vector::push_back(&mut result, conv_sum);
            i = i + 1;
        };
        result
    }

}
