module tensorflowsui::Graph {

    public struct Layer has copy, drop {
        name: vector<u8>,          // 레이어 이름 (vector<u8>으로 변경)
        layer_type: vector<u8>,    // 레이어 타입 (Dense, Conv2D)
        input_nodes : u64,
        output_nodes : u64,
        weights: vector<u64>,      // 레이어의 가중치
        bias: vector<u64>,                 // 편향 (bias)
    }

    public struct Graph has drop {
        layers: vector<Layer>,     // 그래프에 포함된 레이어
    }

    public fun get_output_nodes(layer : &Layer) : u64 {

        layer.output_nodes
    }
    // 필드 접근 함수 추가
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

    // 그래프 생성
    public fun create(): Graph {
        Graph { layers: vector::empty<Layer>() }
    }

    // 레이어 추가
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

        // 모든 편향을 0으로 초기화
        let mut i = 0;
        while (i < output_nodes) {
            vector::push_back(&mut bias, 0);
            i = i + 1;
        };

        bias
    }

// Dense 레이어 생성 및 추가
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

    // Input 레이어 생성 및 추가 (입력 레이어는 가중치 없음)
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



//  // 레이어의 가중치 설정
//     public fun set_layer_weights(graph: &mut Graph, name: vector<u8>, weights: vector<u64>, bias: u64) {
//         let mut i = 0;
//         while (i < vector::length(&graph.layers)) {
//             // 레이어 참조 가져오기
//             let layer_ref = vector::borrow_mut(&mut graph.layers, i);
//             if (layer_ref.name == name) {
//                 // 참조를 통해 직접 값 수정
//                 layer_ref.weights = weights;
//                 layer_ref.bias = bias;
//                 return;
//             }
//             i = i + 1;
//         }
//     }

// // 레이어의 가중치 설정
// public fun set_layer_weights(graph: &mut Graph, name: vector<u8>, weights: vector<u64>, bias: vector<u64>) {
//     let len = vector::length(&graph.layers); // 그래프 길이 가져오기
//     let mut z = 0;

//     while ( z < len ) {
//         if (vector::borrow(&graph.layers, z).name == name) {
//             // 레이어를 수정
//             vector::borrow_mut(&mut graph.layers, z).weights = weights;
//             vector::borrow_mut(&mut graph.layers, z).bias = bias;
            
//         };
//         z = z +1;
//     }

// }


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
        abort 1; // 레이어가 없으면 오류 발생
    }







    // 레이어 가져오기
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
         // 실패 시 종료
    }


    // Dense 레이어 적용
    public fun apply_dense(inputs: vector<u64>, weights: &vector<u64>, bias: &vector<u64>, output_nodes: u64): vector<u64> {
    let mut result = vector::empty<u64>();
    let input_size = vector::length(&inputs);

    let mut i = 0;
    while (i < output_nodes) {
        let mut weighted_sum = 0;
        let mut j = 0;

        while (j < input_size) {
            weighted_sum = weighted_sum + (inputs[j] * weights[i * input_size + j]);
            j = j + 1;
        };

        weighted_sum = weighted_sum + *vector::borrow(bias, i);
        vector::push_back(&mut result, weighted_sum);
        i = i + 1;
    };

    result
}

    // Conv2D 레이어 적용 (단순한 예시로, 1D 커널 적용)
    public fun apply_conv2d(prev_output: vector<u64>, weights: &vector<u64>, bias: u64): vector<u64> {
        let mut result = vector::empty<u64>();
        let kernel_size = vector::length(weights);
        let prev_output_size = vector::length(&prev_output);

        // 간단히 1D convolution 연산 (슬라이딩 윈도우 적용)
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

    // // vector<u8> to string (디버깅용)
    // public fun vector_to_string(input: &vector<u8>): String {
    //     let mut result = String::empty();
    //     let i = 0;
    //     while (i < vector::length(input)) {
    //         String::push(&mut result, *vector::borrow(input, i) as u8);
    //         i = i + 1;
    //     }
    //     result
    // }
}
