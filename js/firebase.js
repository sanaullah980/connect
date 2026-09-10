// Paste your Firebase web configuration here. UI modules do not contain Firebase secrets.
const firebaseConfig={apiKey:'',authDomain:'',projectId:'',storageBucket:'',messagingSenderId:'',appId:''};
const firebaseReady=()=>Boolean(firebaseConfig.apiKey&&firebaseConfig.projectId);
