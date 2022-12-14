import { Component } from '@angular/core';
import { Firestore, collectionData,} from '@angular/fire/firestore';
import { addDoc, collection, doc,deleteDoc } from '@firebase/firestore'
import {Observable} from 'rxjs';
import { Storage, ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 
"@angular/fire/storage";
import { FileUpload } from './file-upload';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { deleteObject } from 'firebase/storage';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentFileUpload?: FileUpload;
  title = 'angularsuku';
  get:any;
  loading:boolean=true;
  selectedFiles:any;
  getDownUrlLink:any;
  sendObject={
    id:"",
    name: "",
    url: "",
  };
  file:any;
  private basePath = '/uploads';
  constructor(public firestore: Firestore,public storage:Storage  ) { }
  
 ngOnInit() {
   this.getAllTodo()
   this.getAllFile()
   console.log(this.get)
   console.log(this.file)
 }

 onChange(event:any){
  this.selectedFiles=event.target.files[0]
 } 
 
 pushFileToStorage(fileUpload: FileUpload){
  // console.log(this.file.name , this.file) 
  const filePath = `${this.basePath}/${fileUpload.file.name}`;
  const storageRef = ref(this.storage, filePath);
  const uploadTask = uploadBytesResumable(storageRef, fileUpload.file);
  uploadTask.on('state_changed', (snapshot) => {
   const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    console.log(error,"error" , error.message)
  }, 
  () => {
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      this.getDownUrlLink=downloadURL;
      this.sendObject['url']=downloadURL;
      this.sendObject['name']=fileUpload.file.name
      this.saveFileData(this.sendObject)
      this.getAllFile()
    });
  }
);
 

 }



saveFileData(fileUpload:any){
    fileUpload.id=doc(collection(this.firestore,'id')).id
    return addDoc(collection(this.firestore,'FileUpload'),fileUpload)
}

getFile() :Observable<[]> {
  let todoRef=collection(this.firestore,'FileUpload');
  collectionData(todoRef,{idField:'id'})
  return collectionData(todoRef,{idField:'id'}) as Observable<[]>
}

getAllFile(){
  this.getFile().subscribe((res)=>{
    this.file=res
  })

}
onUpload(){
  if (this.selectedFiles) {
    const file=this.selectedFiles

    if (file) {
      this.currentFileUpload = new FileUpload(file);
      this.pushFileToStorage(this.currentFileUpload)
    }
  }
}


 createTodo(todo:any) {
    todo.id= doc(collection(this.firestore,'id')).id
    return addDoc(collection(this.firestore,'Todo'),todo)
}
onClickSubmit(data:any) {
  console.log(data,"")
  this.loading = false
  this.createTodo(data).then((res)=>{
    if(res){
      // this.loading=false
      alert("successfully added to the store")
      
    }
    else{
      alert("failed to add to the store")
    }
  })
  this.loading=true
  this.getAllTodo();
  
}

getTodo() :Observable<[]> {
  let todoRef=collection(this.firestore,'Todo');
  collectionData(todoRef,{idField:'id'})
  return collectionData(todoRef,{idField:'id'}) as Observable<[]>
}

getAllTodo(){
  this.getTodo().subscribe((res)=>{
    console.log(res)
    this.get=[...res]
  })

}

deleteFile(key:string,name:string): void {
  console.log(key, name)
  this.deleteFileDatabase(key)
    .then(() => {
      this.deleteFileStorage(name);
    })
    .catch(error => console.log(error));
}

private deleteFileDatabase(key: string): Promise<void> {
  let deleteRef=doc(collection(this.firestore,`FileUpload/${key}`))
  return deleteDoc(deleteRef)
 
}

private deleteFileStorage(name: string): void {
  const filePath = `${this.basePath}/${name}`
  const desertRef = ref(this.storage, filePath);
  deleteObject(desertRef).then(() => {
    // File deleted successfully
  }).catch((error) => {
    // Uh-oh, an error occurred!
  });
}
}
