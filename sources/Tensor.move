module tensorflowsui::Tensor {
    public struct Tensor has drop {
        shape: vector<u64>,    // 텐서의 차원
        data: vector<u64>,     // 텐서의 데이터
    }

    // 텐서 생성
    public fun create(shape: vector<u64>, data: vector<u64>): Tensor {
        assert!(vector::length(&shape) > 0, 1); // 최소 1차원이어야 함
        Tensor { shape, data }
    }

}
