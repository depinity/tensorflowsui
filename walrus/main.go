package main

import (
	"encoding/json"
	"log"
	"net/http"

	walrus "github.com/namihq/walrus-go"

	"fmt"
)

// 개별 파일 데이터 구조
// 개별 파일 데이터 구조
type FileData struct {
	Filepath string      `json:"filepath"`
	Filename string      `json:"filename"`
	Label    int         `json:"label"`
	Data     DataDetails `json:"data"`
}

// 데이터 상세 구조
type DataDetails struct {
	Sign []int `json:"sign"`
	Mag  []int `json:"mag"`
}

// 최상위 JSON 구조
type ModelData struct {
	Train []FileData `json:"train"`
	Test  []FileData `json:"test"`
}

type UploadTrainSetRes struct {
	Status string `json:"status"`
	BlobID string `json:"blobId"`
}

type StoreReq struct {
	DigestArr             []string `json:"digestArr"`
	PartialDenseDigestArr []string `json:"partialDensesDigestArr"`
	VersionArr            []string `json:"versionArr"`
}

type StoreRes struct {
	Status string `json:"status"`
	BlobID string `json:"blobId"`
}

type InputReq struct {
	Label int `json:"label"`
}

type InputRes struct {
	BlobID    string `json:"blobId"`
	InputMag  []int  `json:"inputMag"`
	InputSign []int  `json:"inputSign"`
	Label     int    `json:"label"`
}

// var storeInputRes StoreInputRes
var uploadTrainSetRes UploadTrainSetRes
var modelData ModelData

// "/get" Handler Func
func handleGetInput(w http.ResponseWriter, r *http.Request) {

	switch r.Method {
	case http.MethodPost:

		var inputReq InputReq
		if err := json.NewDecoder(r.Body).Decode(&inputReq); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		inputRes := InputRes{}
		for _, trainData := range modelData.Train {
			if inputReq.Label == trainData.Label {

				inputRes.BlobID = uploadTrainSetRes.BlobID
				inputRes.InputMag = trainData.Data.Mag
				inputRes.InputSign = trainData.Data.Sign
				inputRes.Label = trainData.Label

				break
			}
		}

		json.NewEncoder(w).Encode(inputRes) // JSON Resp
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// "/store" Handler Func
func handleStore(w http.ResponseWriter, r *http.Request) {

	switch r.Method {
	case http.MethodPost:
		var storeReq StoreReq
		if err := json.NewDecoder(r.Body).Decode(&storeReq); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		fmt.Println("Digest: ", storeReq.DigestArr)
		fmt.Println("PartialDenseDigest: ", storeReq.PartialDenseDigestArr)
		fmt.Println("Version: ", storeReq.VersionArr)
		blobId, err := storeWalrus(storeReq)
		res := StoreRes{
			BlobID: blobId,
		}
		if err != nil {
			res.Status = "failure"
			json.NewEncoder(w).Encode(res) // JSON Resp
		}
		res.Status = "success"
		json.NewEncoder(w).Encode(res) // JSON Resp
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func storeWalrus(storeReq StoreReq) (string, error) {
	// walrus
	wClient := walrus.NewClient(
		walrus.WithAggregatorURLs([]string{"https://aggregator.walrus-testnet.walrus.space"}),
		walrus.WithPublisherURLs([]string{"https://publisher.walrus-testnet.walrus.space"}),
	)

	// Store data
	jsonBytes, err := json.Marshal(storeReq)
	if err != nil {
		fmt.Println("JSON err:", err)
		return "", err
	}

	wData := []byte(jsonBytes)
	resp, err := wClient.Store(wData, &walrus.StoreOptions{Epochs: 10})

	if err != nil {
		log.Fatalf("Error storing data: %v", err)
		return "", err
	}

	var blobID string
	// Check response type and handle accordingly
	if resp.NewlyCreated != nil {
		blobID = resp.NewlyCreated.BlobObject.BlobID
		fmt.Printf("Stored new blob ID: %s with cost: %d\n",
			blobID, resp.NewlyCreated.Cost)
	} else if resp.AlreadyCertified != nil {
		blobID = resp.AlreadyCertified.BlobID
		fmt.Printf("Blob already exists with ID: %s, end epoch: %d\n",
			blobID, resp.AlreadyCertified.EndEpoch)
	}

	// Read data
	retrievedData, err := wClient.Read(blobID, nil)

	if err != nil {
		log.Fatalf("Error reading data: %v", err)
	}
	fmt.Printf("Retrieved data: %s\n", string(retrievedData))

	return blobID, nil
}

func uploadTrainSet(w http.ResponseWriter, r *http.Request) {
	// // POST 요청인지 확인
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// JSON 디코딩
	if err := json.NewDecoder(r.Body).Decode(&modelData); err != nil {
		http.Error(w, "Error parsing JSON", http.StatusBadRequest)
		return
	}

	// JSON 데이터 출력 (디버깅용)
	fmt.Printf("Received JSON: %+v\n", modelData)

	// Walrus 업로드
	wClient := walrus.NewClient(
		walrus.WithAggregatorURLs([]string{"https://aggregator.walrus-testnet.walrus.space"}),
		walrus.WithPublisherURLs([]string{"https://publisher.walrus-testnet.walrus.space"}),
	)

	// Store data
	jsonBytes, err := json.Marshal(modelData)
	if err != nil {
		http.Error(w, "JSON Error", http.StatusInternalServerError)
	}

	wData := []byte(jsonBytes)
	resp, err := wClient.Store(wData, &walrus.StoreOptions{Epochs: 10})

	if err != nil {
		log.Fatalf("Error storing data: %v", err)
		http.Error(w, "Error storing data", http.StatusInternalServerError)
	}

	var blobID string
	// Check response type and handle accordingly
	if resp.NewlyCreated != nil {
		blobID = resp.NewlyCreated.BlobObject.BlobID
		fmt.Printf("Stored new blob ID: %s with cost: %d\n",
			blobID, resp.NewlyCreated.Cost)
	} else if resp.AlreadyCertified != nil {
		blobID = resp.AlreadyCertified.BlobID
		fmt.Printf("Blob already exists with ID: %s, end epoch: %d\n",
			blobID, resp.AlreadyCertified.EndEpoch)
	}

	// Read data
	retrievedData, err := wClient.Read(blobID, nil)

	if err != nil {
		log.Fatalf("Error reading data: %v", err)
	}
	fmt.Printf("Retrieved data: %s\n", string(retrievedData))

	uploadTrainSetRes = UploadTrainSetRes{
		Status: "success",
		BlobID: blobID,
	}

	json.NewEncoder(w).Encode(uploadTrainSetRes) // JSON Resp
}

func main() {

	// Handler
	http.HandleFunc("/train-set", uploadTrainSet)
	http.HandleFunc("/get", handleGetInput)
	http.HandleFunc("/store", handleStore)

	fmt.Println("Server is running...")
	log.Fatal(http.ListenAndServe(":8083", nil))

}
