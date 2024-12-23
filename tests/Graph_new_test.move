module tensorflowsui::Graph_new_tests {
    use std::debug;

    /// 레이어 정의
    public struct Layer has copy, drop {
        name: vector<u8>,
        layer_type: vector<u8>,
        input_nodes : u64,
        output_nodes : u64,
        weights: vector<u64>,
        bias: vector<u64>,
    }

    /// 그래프 구조
    public struct Graph has drop {
        layers: vector<Layer>,
    }

    /// sign bit 확인: 최상위 비트가 1이면 음수
    fun is_neg(x: u64): bool {
        (x >> 63) == 1
    }

    /// ReLU (signed): x가 음수이면 0, 아니면 x 그대로
    fun signed_relu(x: u64): u64 {
        if (is_neg(x)) {
            // 음수
            0
        } else {
            // 양수나 0이면 그대로 반환
            x
        }
    }

    /// 덧셈 (2의 보수): 단순 u64 덧셈으로 2의 보수 연산 가능
    fun signed_add(a: u64, b: u64): u64 {
        a + b
    }

    /// 곱셈 (2의 보수): 단순 u64 곱셈
    fun signed_mul(a: u64, b: u64): u64 {
        a * b
    }

    /// 그래프 관련 함수들
    public fun get_output_nodes(layer : &Layer) : u64 {
        layer.output_nodes
    }

    public fun get_weights(layer: &Layer): vector<u64> {
        layer.weights
    }

    public fun get_bias(layer: &Layer): vector<u64> {
        layer.bias
    }

    public fun get_layer_type(layer: &Layer): &vector<u8> {
        &layer.layer_type
    }

    public fun get_name(layer: &Layer): &vector<u8> {
        &layer.name
    }

    public fun create(): Graph {
        Graph { layers: vector::empty<Layer>() }
    }

    public fun add_layer(graph: &mut Graph, name: vector<u8>, layer_type: vector<u8>, input_nodes:u64, output_nodes:u64  ) {
        let weights : vector<u64> = initialize_weights(input_nodes, output_nodes);
        let bias : vector<u64> = initialize_bias(output_nodes);
        let layer = Layer { name, layer_type, input_nodes, output_nodes, weights, bias };
        vector::push_back(&mut graph.layers, layer);
    }

    /// 초기 weights는 모두 1로 설정 (양수 1)
    public fun initialize_weights(input_nodes: u64, output_nodes:u64 ) : vector<u64> {
        let mut weights = vector::empty<u64>();
        let mut i = 0;
        while ( i < input_nodes * output_nodes) {
            vector::push_back(&mut weights, 1);
            i = i +1;
        };
        weights
    }

    /// 초기 bias는 모두 0으로 설정
    public fun initialize_bias(output_nodes: u64): vector<u64> {
        let mut bias = vector::empty<u64>();
        let mut i = 0;
        while (i < output_nodes) {
            vector::push_back(&mut bias, 0);
            i = i + 1;
        };
        bias
    }

    /// Dense 레이어 생성
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

    /// Input 레이어 생성
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

    /// 특정 레이어 이름에 해당하는 weights와 bias 설정
    /// 여기서 weights나 bias에 음수값(2의 보수 u64)도 넣을 수 있음
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

    /// apply_dense를 signed 연산으로 수정
    /// inputs, weights, bias는 2의 보수로 해석
    /// 연산: weighted_sum = Σ(inputs[j]*weights[ij]) + bias[i]
    /// ReLU도 signed로 판단
    public fun apply_dense(inputs: vector<u64>, weights: &vector<u64>, bias: &vector<u64>, output_nodes: u64): vector<u64> {
        let mut result = vector::empty<u64>();
        let input_size = vector::length(&inputs);

        std::debug::print(&std::string::utf8(b"input vector:"));
        debug::print(&inputs);

        std::debug::print(&std::string::utf8(b"input number:"));
        debug::print(&input_size);
        
        std::debug::print(&std::string::utf8(b"output number:"));
        debug::print(&output_nodes);

        let mut i = 0;
        while (i < output_nodes) {
            let mut weighted_sum = 0;
            let mut j = 0;

            while (j < input_size) {
                let weight_index = i * input_size + j;
                // signed multiplication
                let prod = signed_mul(inputs[j], weights[weight_index]);
                weighted_sum = signed_add(weighted_sum, prod);
                j = j + 1;
            };

            weighted_sum = signed_add(weighted_sum, *vector::borrow(bias, i));
            weighted_sum = signed_relu(weighted_sum);
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
                let prod = signed_mul(prev_output[i+j], weights[j]);
                conv_sum = signed_add(conv_sum, prod);
                j = j + 1;
            };
            conv_sum = signed_add(conv_sum, bias);
            // 필요하다면 conv2d에도 ReLU 적용 가능
            conv_sum = signed_relu(conv_sum);
            vector::push_back(&mut result, conv_sum);
            i = i + 1;
        };
        result
    }

}
