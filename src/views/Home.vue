
<template>
  <div class="daily">
    <!-- <h1>{{ msg }}</h1> -->
    <input type="text" v-model="title" placeholder="Title" />
    <textarea v-model="text" @input="onTextAreaInput" name="" id="" cols="20" rows="15"></textarea>
    <div class="buttonArea">
     <button style="margin-right:5px;" @click="isShow = !isShow">edit</button> 
     <button @click="saveText">save</button> 
    </div>
    <div class="list">
      <ul>
        <li v-for="(daily, idx) in dailys" :key="idx">
          <div @click="handleItemClick(daily)"> {{ daily.title }}</div>
            <button v-show="isShow" @click="deleteItem(daily.id)">delete</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router";

const dailys = ref<any[]>([])
const title = ref<string>('')
const text = ref<string>('')
const isShow = ref<boolean>(false);
const router = useRouter();

onMounted(() => {
  // 로컬 스토리지에서 저장된 텍스트 배열을 가져옴
  getList()
})


const onTextAreaInput = (event:any) => {
  let newText = (event.target as HTMLTextAreaElement).value;
      // 엔터 키를 눌렀을 때 '\n' 처리
      if (event.key  === 'Enter') {
        newText += '\n';
      }
      text.value = newText;
}

const handleItemClick = (v:any) => {
  const uniqId = v.id
  router.push(`/list?id=${uniqId}`);
};

const getList = () => {
  const savedTexts = JSON.parse(localStorage.getItem('savedTexts') || '[]');
  
  // 가져온 텍스트 배열을 dailys 배열에 할당
  dailys.value = savedTexts;
}

const saveText = () => {
  // const savedTexts = JSON.parse(localStorage.getItem('savedTexts') || '[]');

  isShow.value = false
  let savedTexts = JSON.parse(localStorage.getItem('savedTexts') || '[]'); // 저장된 텍스트 배열 가져오기
  if(text.value.length < 2 || title.value.length < 1) {
    alert("내용을 입력해주세요")
    dailys.value = savedTexts;
    return
  }
  const id = generateId(); // 고유한 id 생성
  savedTexts.push({ id: id, title: title.value, text: text.value }); // 새로운 텍스트 추가
  localStorage.setItem('savedTexts', JSON.stringify(savedTexts)); // 배열을 다시 local storage에 저장
  dailys.value = savedTexts;
  title.value = "";
  text.value = ""
}

const deleteItem = (id:any) => {
  // 로컬 스토리지에서 저장된 데이터 가져오기
  const savedTextsStr = localStorage.getItem('savedTexts');
  let savedTexts = savedTextsStr ? JSON.parse(savedTextsStr) : [];

  // 해당 아이템의 인덱스 찾기
  const index = savedTexts.findIndex((item:any) => item.id === id);

  if (index !== -1) {
    // 아이템 삭제
    savedTexts.splice(index, 1);
    // 수정된 데이터 다시 로컬 스토리지에 저장
    localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
    // 화면에서도 해당 아이템 삭제
    dailys.value.splice(index, 1);
    // isShow.value = false
    console.log(`Item with ID ${id} deleted`);
  } else {
    console.log(`Item with ID ${id} not found`);
  }
}

const generateId = () => {
  // 현재 시간을 이용하여 고유한 id 생성
  return new Date().getTime().toString(36);
}

</script>

<style lang="less" scoped>
.daily {

  margin:20vh auto 0;
  max-width: 1903px;
  width: 90%;
  input[type="text"] {
    max-width: 583px;
    width: 100%;
    padding:15px;
    outline : none;
    border: none;
    margin-bottom: 10px;
    border-radius: 5px;
  }
  textarea {
    max-width: 583px;
    width: 100%;
    padding:15px;
    font-size:16px;
    resize:none;
    outline: none;
    border: none;
    border-radius: 5px;
    &:focus {outline: none; border:none;}
    display: block;
    margin:0 auto;
    scrollbar-width: thin; /* Firefox */
  }
  .buttonArea {
    max-width: 600px; 
    margin: 10px auto; 
    display: flex; 
    justify-content: flex-end;
  }
  .list {
    overflow:auto;
    max-width: 600px;
    width: 100%;
    height:30vh;
    margin: 0 auto;
    scrollbar-width: thin; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera*/
    }
    &>ul {
      padding-left: 0;
      &>li {
        white-space: pre-line;
        border-radius: 5px;
        background-color:#2f2f2f;
        padding: 10px;
        text-align: left;
        position: relative;
        list-style-type: none;
        margin-bottom: 20px;
      &>div {
        
      }
      &>button {
        position: absolute;
        right: 0;
        top: 0;
      }
    }
   }
  }
}

@media screen and (min-width : 300px) and (max-width : 760px) {
  .daily {
  margin:0 auto;
  max-width: 100%;
  margin-top: -100px;
  width: 100%;
  input[type="text"] {
    // word-spacing: -7px; /* 단어 간격을 줄임 */
    max-width: 80%;
    font-size:15px;
    width: 100%;
    padding:15px;
    outline : none;
    border: none;
    margin-bottom: 10px;
    border-radius: 5px;
  }
  textarea {
    // letter-spacing: -3px; /* 글자 간격을 줄임 */
    word-spacing: -7px; /* 단어 간격을 줄임 */
    font-size:12px;
    max-width: 80%;
    width: 100%;
    padding:15px;
    font-size:16px;
    resize:none;
    outline: none;
    border: none;
    border-radius: 5px;
    &:focus {outline: none; border:none;}
    display: block;
    margin:0 auto;
    scrollbar-width: thin; /* Firefox */
  }
  .buttonArea {
    max-width: 85%; 
    margin: 10px auto; 
    display: flex; 
    justify-content: flex-end;
  }
  .list {
    overflow:auto;
    max-width: 90%;
    width: 100%;
    height:30vh;
    margin: 0 auto;
    scrollbar-width: thin; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera*/
    }
    &>ul {
      padding-left: 0;
      &>li {
        white-space: pre-line;
        border-radius: 5px;
        background-color:#2f2f2f;
        padding: 10px;
        text-align: left;
        position: relative;
        list-style-type: none;
        margin-bottom: 20px;
      &>div {
        
      }
      &>button {
        position: absolute;
        right: 0;
        top: 0;
      }
    }
   }
  }
}
}
</style>
