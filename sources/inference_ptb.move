module tensorflowsui::inference_ptb {
    use tensorflowsui::tensor::{ Tensor, SignedFixedTensor, from_input, debug_print_tensor,argmax};
    use tensorflowsui::graph_ptb as graph;
    use tensorflowsui::model_ptb as model;

    use std::debug;
    use sui::event;

    public struct Result has copy, drop {
        value : u64
    }
    

    fun test_check2() {
         let scale = 2;
        
        // // label 0
        // debug::print(&std::string::utf8(b"true label: 0"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 96, 1, 0, 0, 0, 33, 62, 29, 45, 0, 0, 0, 50, 0, 0, 88, 0, 0, 17, 0, 0, 54, 7, 0, 0, 11, 97, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 1
        // debug::print(&std::string::utf8(b"true label: 1"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 45, 12, 0, 0, 0, 0, 0, 93, 0, 0, 0, 0, 0, 83, 1, 0, 0, 0, 0, 28, 62, 0, 0, 0, 0, 0, 97, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 2
        // debug::print(&std::string::utf8(b"true label: 2"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 71, 0, 0, 0, 0, 77, 65, 61, 0, 0, 0, 0, 1, 72, 92, 0, 0, 0, 14, 54, 66, 31, 73, 0, 0, 55, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 3
        // debug::print(&std::string::utf8(b"true label: 3"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 85, 99, 17, 0, 0, 0, 3, 0, 56, 32, 0, 0, 0, 62, 93, 90, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 90, 76, 94, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 4
        // debug::print(&std::string::utf8(b"true label: 4"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 66, 0, 0, 0, 99, 0, 0, 95, 0, 0, 0, 51, 60, 87, 99, 0, 0, 0, 6, 67, 0, 99, 2, 0, 0, 0, 0, 0, 33, 57, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 5
        // debug::print(&std::string::utf8(b"true label: 5"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0, 0, 0, 0, 53, 25, 0, 0, 0, 0, 25, 33, 6, 0, 0, 0, 8, 0, 45, 0, 0, 0, 0, 28, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 6
        // debug::print(&std::string::utf8(b"true label: 6"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 79, 44, 0, 0, 0, 0, 4, 89, 0, 0, 0, 0, 0, 59, 92, 43, 0, 0, 0, 0, 49, 89, 90, 30, 0, 0, 0, 0, 61, 81, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 7
        // debug::print(&std::string::utf8(b"true label: 7"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 39, 39, 71, 0, 0, 0, 0, 0, 0, 54, 16, 0, 0, 3, 74, 52, 10, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 8
        debug::print(&std::string::utf8(b"true label: 8"));
        let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 44, 30, 37, 0, 0, 0, 50, 3, 89, 0, 0, 0, 0, 0, 99, 5, 0, 0, 0, 0, 63, 5, 46, 0, 0, 0, 0, 97, 85, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // // label 9
        // debug::print(&std::string::utf8(b"true label: 9"));
        // let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 46, 0, 0, 0, 0, 12, 8, 75, 0, 0, 0, 0, 0, 85, 30, 0, 0, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0];
        // let input_sign  = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


    }


    // Initialize the network
    public entry fun initialize(ctx: &mut TxContext) {
        let mut graph = graph::create_signed_graph(ctx);
        model::create_model_signed_fixed(&mut graph, 2); 
        let mut partials = model::create_partial_denses(ctx);
        model::add_partials_for_all_but_last(&graph, &mut partials);

        // scale = 2
        graph::share_graph(graph);
        model::share_partial(partials);

    }

    // Test function with sample input
    public entry fun test_inference(graph: &graph::SignedFixedGraph, pd1: &mut model::PartialDenses) {
        let scale = 2;
        
        debug::print(&std::string::utf8(b"true label: 8"));
        let input_mag = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 44, 30, 37, 0, 0, 0, 50, 3, 89, 0, 0, 0, 0, 0, 99, 5, 0, 0, 0, 0, 63, 5, 46, 0, 0, 0, 0, 97, 85, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let input_sign = vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        model::ptb_graph_compute_chunk(
            graph,
            pd1,
            b"dense1",
            input_mag,
            input_sign,
            0,
            8
        );

        model::ptb_graph_compute_chunk(
            graph,
            pd1,
            b"dense1",
            input_mag,
            input_sign,
            8,
            16
        );

        // 2) finalize => (mag1, sign1, scale1)
        let (mag1, sign1, scale1) = model::ptb_graph_finalize(
            graph,
            pd1,
            b"dense1"
        );
        
        let (mag2, sign2, scale2) = model::ptb_graph_2(graph, mag1, sign1, scale1);
        let label = model::ptb_graph_3(graph, mag2, sign2, scale2);

        debug::print(&std::string::utf8(b"predicted label: "));
        debug::print(&label);
    }




}
