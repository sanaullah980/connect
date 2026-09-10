// Paste your Firebase web configuration here. UI modules do not contain Firebase secrets.
export const firebaseConfig={apiKey:'',authDomain:'',projectId:'',storageBucket:'',messagingSenderId:'',appId:''};
export const firebaseReady=()=>Boolean(firebaseConfig.apiKey&&firebaseConfig.projectId);
