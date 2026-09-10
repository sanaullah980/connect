// Storage helpers are intentionally isolated. Implement Firebase Storage upload/download here.
// Multiple-file ZIP bundling should happen client-side; automatic OS extraction after download cannot be guaranteed by a browser.
export async function prepareBundle(files){return [...files].map(f=>({name:f.name,size:f.size,type:f.type}))}
