import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signInWithRedirect,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,deleteDoc,updateDoc,collection,getDocs,getCountFromServer} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const cfg=window.FIREBASE_CONFIG;
const ok=!!(cfg&&cfg.apiKey&&cfg.projectId);
let auth,db;
if(ok){const app=initializeApp(cfg);auth=getAuth(app);db=getFirestore(app)}
window.FB={
  ok,
  onUser(cb){if(!ok){cb(null);return}onAuthStateChanged(auth,cb)},
  signIn(){
    const p=new GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});
    return signInWithPopup(auth,p).catch(e=>{
      if(e.code==="auth/popup-blocked"||e.code==="auth/operation-not-supported-in-this-environment")return signInWithRedirect(auth,p);
      throw e;
    });
  },
  signOut(){return signOut(auth)},
  async role(email){
    const a=await getDoc(doc(db,"admins",email)).catch(()=>null);
    const t=await getDoc(doc(db,"trainers",email)).catch(()=>null);
    return{admin:!!(a&&a.exists()),trainer:!!(t&&t.exists()&&t.data().active!==false)};
  },
  async clients(email){const s=await getDocs(collection(db,"trainers",email,"clients"));return s.docs.map(d=>({id:d.id,...d.data()}))},
  async count(email){const s=await getCountFromServer(collection(db,"trainers",email,"clients"));return s.data().count},
  saveClient(email,id,data){return setDoc(doc(db,"trainers",email,"clients",id),data,{merge:true})},
  async getClient(email,id){const s=await getDoc(doc(db,"trainers",email,"clients",id));return s.exists()?s.data():null},
  updateClientData(email,id,data){return updateDoc(doc(db,"trainers",email,"clients",id),data)},
  deleteClient(email,id){return deleteDoc(doc(db,"trainers",email,"clients",id))},
  async access(email){const s=await getDoc(doc(db,"clientAccess",email));return s.exists()?s.data():null},
  setAccess(email,data){return setDoc(doc(db,"clientAccess",email),data)},
  deleteAccess(email){return deleteDoc(doc(db,"clientAccess",email))},
  async trainers(){const s=await getDocs(collection(db,"trainers"));return s.docs.map(d=>({email:d.id,...d.data()}))},
  setTrainer(email,data){return setDoc(doc(db,"trainers",email),data,{merge:true})},
  removeTrainer(email){return deleteDoc(doc(db,"trainers",email))}
};
window.dispatchEvent(new Event("fbready"));
