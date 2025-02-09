package main

import (
	"encoding/json"
	"log"
	"net/http"

	walrus "github.com/namihq/walrus-go"

	"fmt"
)

type StoreInput struct {
	InputMag  []uint64 `json:"inputMag"`
	InputSign []uint64 `json:"inputSign"`
}

type StoreInputRes struct {
	BlobID    string   `json:"blobId"`
	InputMag  []uint64 `json:"inputMag"`
	InputSign []uint64 `json:"inputSign"`
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

type UploadedTrainSetRes struct {
	Status string `json:"status"`
	BlobID string `json:"blobId"`
}

var storeInputRes StoreInputRes
var uploadTrainSetRes UploadedTrainSetRes

// "/get" Handler Func
func handleGetInput(w http.ResponseWriter, r *http.Request) {

	switch r.Method {
	case http.MethodGet:
		json.NewEncoder(w).Encode(storeInputRes) // JSON Resp
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// "/train-set" Handler Func
func handleGetTrainSetBlobID(w http.ResponseWriter, r *http.Request) {

	switch r.Method {
	case http.MethodGet:
		json.NewEncoder(w).Encode(uploadTrainSetRes) // JSON Resp
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

func initInput() (StoreInputRes, error) {
	input_mag := []uint64{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 79, 44, 0, 0, 0, 0, 4, 89, 0, 0, 0, 0, 0, 59, 92, 43, 0, 0, 0, 0, 49, 89, 90, 30, 0, 0, 0, 0, 61, 81, 0, 0, 0, 0, 0, 0, 0, 0, 0}
	input_sign := []uint64{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}

	storeInput := StoreInput{
		InputMag:  input_mag,
		InputSign: input_sign,
	}
	wClient := walrus.NewClient(
		walrus.WithAggregatorURLs([]string{"https://aggregator.walrus-testnet.walrus.space"}),
		walrus.WithPublisherURLs([]string{"https://publisher.walrus-testnet.walrus.space"}),
	)

	// Store data
	jsonBytes, err := json.Marshal(storeInput)
	if err != nil {
		fmt.Println("JSON err:", err)
		return StoreInputRes{}, err
	}

	wData := []byte(jsonBytes)
	resp, err := wClient.Store(wData, &walrus.StoreOptions{Epochs: 10})

	if err != nil {
		log.Fatalf("Error storing data: %v", err)
		return StoreInputRes{}, err
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

	storeInputRes := StoreInputRes{
		BlobID:    blobID,
		InputMag:  input_mag,
		InputSign: input_sign,
	}

	return storeInputRes, nil
}

func uploadTrainSet() (UploadedTrainSetRes, error) {

	wClient := walrus.NewClient(
		walrus.WithAggregatorURLs([]string{"https://aggregator.walrus-testnet.walrus.space"}),
		walrus.WithPublisherURLs([]string{"https://publisher.walrus-testnet.walrus.space"}),
	)

	uploadedFile, err := wClient.StoreFile("./mnist_selected.json", &walrus.StoreOptions{Epochs: 5})
	if err != nil {
		log.Fatalf("Error storing file: %v", err)
		return UploadedTrainSetRes{}, err
	}
	fmt.Printf("Stored file blob ID: %s\n", uploadedFile)

	err = wClient.ReadToFile(uploadedFile.Blob.BlobID, "./read_mnist_selected.json", nil)
	if err != nil {
		log.Fatalf("Error reading file: %v", err)
		return UploadedTrainSetRes{}, err
	}
	fmt.Println("File retrieved successfully")

	return UploadedTrainSetRes{
		Status: "success",
		BlobID: uploadedFile.Blob.BlobID,
	}, nil
}

func main() {

	_storeInputRes, err := initInput()
	if err != nil {
		fmt.Println("Failed to store input")
		return
	}
	storeInputRes = _storeInputRes

	_uploadedTrainSetRes, err := uploadTrainSet()
	if err != nil {
		fmt.Println("Failed to upload train set")
		return
	}
	uploadTrainSetRes = _uploadedTrainSetRes

	// Handler
	http.HandleFunc("/get", handleGetInput)
	http.HandleFunc("/train-set", handleGetTrainSetBlobID)
	http.HandleFunc("/store", handleStore)

	fmt.Println("Server is running...")
	log.Fatal(http.ListenAndServe(":8083", nil))

}
