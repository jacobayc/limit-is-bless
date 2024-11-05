
<template>
  <div class="daily">
    <!-- <h1>{{ msg }}</h1> -->
    <div class="title" @click="toggleTextArea"> Élan vital </div>
    <div v-if="isEditMode" style="width: 85%; font-size:12px; margin:0 auto; text-align: left;">
      <p style="width: 75px; text-align: center; background:purple; border-radius: 8px;">Edit Mode</p>
    </div>
    <input :style="{ outline: isEditMode ? '1px dashed lime' : 'none' }" type="text" v-model="title" placeholder="Title" />
    <textarea :style="{ outline: isEditMode ? '1px dashed lime' : 'none' }" v-model="text" @input="onTextAreaInput" name="" id="" cols="20" :rows="textareaRows" ref="textareaElement"></textarea>
    <div class="buttonArea">
    <div class="searchArea" v-if="isShow">
      <input type="text" v-model="searchQuery" placeholder="Search..." />
    </div>
     <p style="margin-right:5px;" @click="isShow = !isShow"><img src="@/assets/setting.png" alt=""></p> 
     <p @click="saveText"><img src="@/assets/save.png" alt=""></p> 
     <p v-show="isShow" style ="position: absolute; left:0; top: 0;" @click="exportToExcel"><img src="@/assets/export.png" alt=""></p> 
   </div>
    <div class="list" v-if="!isListHidden">
      <ul>
        <li v-for="(daily, idx) in filteredDailys" :key="idx">
          <div @click="handleItemClick(daily)"> {{ daily.title}} <span style="font-size:10px; color:#777;">{{ daily.date }}</span></div>
          <div class="userBtn">
            <p v-show="isShow" @click="editItem(daily)"><img src="@/assets/edit.png" alt=""></p>
            <p v-show="isShow" @click="deleteItem(daily.id)"><img src="@/assets/delete.png" alt=""></p>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <Toast v-if="isToastMessage" :message="toastMessage" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from "vue-router";
import Toast from '../components/Toast.vue'; // Toast 컴포넌트 import

interface SavedText {
  date: string;
  title: string;
  text: string;
  id: string | number;
}

interface Daily {
  title: string;
  text: string;
  id: string;
  date: string;
}

const dailys = ref<Daily[]>([])
const title = ref<string>('')
const text = ref<string>('')
const isShow = ref<boolean>(false);
const router = useRouter();
const editingItemId = ref<string>('')
const isEditMode = ref<boolean>(false)
let autoSaveInterval: number | null = null; // 변수 선언
const toastMessage = ref<string | null>(null);
const isToastMessage = ref<boolean>(false);
const searchQuery = ref<string>('');  // 검색어

//리스트 가리가
const textareaElement = ref<HTMLTextAreaElement | null>(null); // textareaElement를 ref로 초기화
const isListHidden = ref<boolean>(false); // 리스트 가리기 상태

const toggleTextArea = () => {
  // textarea의 row 값을 토글하는 함수
  if (textareaElement.value) { // textareaElement가 null이 아닐 때만 접근
    if (isListHidden.value) {
      textareaElement.value.rows = 15; // 원래대로
      isListHidden.value = false; // 리스트 표시
    } else {
      textareaElement.value.rows = 35; // 35으로 변경
      isListHidden.value = true; // 리스트 숨김
    }
  }
};

//자동 저장 함수
const startAutoSave = () => {
  // isEditMode가 true이고 1분마다 saveText 함수를 호출하여 자동 저장
  if (isEditMode.value) {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval); // 기존 간격 제거
    }
    autoSaveInterval = setInterval(saveTextAutomatically, 300000); // 5분마다 호출 (60 * 1000 milliseconds)
  }
}
// 토스트 메시지 노출
const showToast = (message: string) => {
  isToastMessage.value = true
  toastMessage.value = message;
  setTimeout(() => {
    isToastMessage.value = false
    toastMessage.value = null;
  }, 2000);
};

onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval); // 컴포넌트 언마운트 시 간격 제거
  }
});

const saveTextAutomatically = () => {
  // title과 text의 값이 존재하는지 확인
  if (title.value && text.value) {

  isShow.value = false
  let savedTexts = JSON.parse(localStorage.getItem('savedTexts') || '[]'); // 저장된 텍스트 배열 가져오기
  if(text.value.length < 2 || title.value.length < 1) {
    // alert("내용을 입력해주세요")
    showToast("내용을 입력해주세요")
    dailys.value = savedTexts;
    return
  }

  const index = savedTexts.findIndex((item:SavedText) => item.id === editingItemId.value);
  const currentDate = new Date(); // 현재 시간을 얻기 위해 Date 객체 생성
  const year = currentDate.getFullYear(); // 연도를 가져옴
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // 월을 가져옴 (0부터 시작하므로 +1 필요, 두 자리로 만듦)
  const day = ('0' + currentDate.getDate()).slice(-2); // 일을 가져옴 (두 자리로 만듦)
  const hours = ('0' + currentDate.getHours()).slice(-2); // 시간을 가져옴 (두 자리로 만듦)

  const currentTimeFormatted = `${year}.${month}.${day}.${hours}`; // yyyy.mm.dd.hh 형식으로 변환
  if (editingItemId.value) {
    // 수정 중인 아이템의 인덱스 찾기
    if (index !== -1) {
      // 해당 아이템의 내용을 수정
      savedTexts[index].title = title.value;
      savedTexts[index].text = text.value;
      savedTexts[index].date = currentTimeFormatted
      localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
      console.log(`Item with ID ${editingItemId.value} updated`);
    } else {
      console.log(`Item with ID ${editingItemId.value} not found`);
    }
  } else {
    const id = generateId(); // 고유한 id 생성
    savedTexts.push({ id: id, title: title.value, text: text.value, date: currentTimeFormatted }); // 새로운 텍스트 추가
    localStorage.setItem('savedTexts', JSON.stringify(savedTexts)); // 배열을 다시 local storage에 저장
    console.log(`New item added with ID ${id}`);
  }
    
    // 로컬스토리지 내용 갱신
    localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
    
    // 화면갱신
    // dailys.value = savedTexts;
    // title.value = "";
    // text.value = ""
  // alert("임시저장 완료")
  showToast("임시저장 완료")
  // isEditMode.value= false
  }
}


const textareaRows = computed(() => {
  return window.innerWidth < 768 ? 10 : 15; // 768은 모바일 화면 너비에 따라 조정 가능
});

const reversedDailys = computed(() => {
  return dailys.value.slice().reverse();
});

// 검색 필터링된 dailys
const filteredDailys = computed(() => {
  if (searchQuery.value) {
    return reversedDailys.value.filter(daily => 
      daily.title.includes(searchQuery.value) || daily.text.includes(searchQuery.value)
    );
  }
  return reversedDailys.value;
});


onMounted(() => {
  // 로컬 스토리지에서 저장된 텍스트 배열을 가져옴
  getList()
})


const editItem = (daily: Daily) => {
  // 해당 항목의 내용을 수정할 수 있도록 title과 text에 저장
  title.value = daily.title;
  text.value = daily.text;

  editingItemId.value = daily.id;
  isShow.value = false;
  isEditMode.value = true;
  // alert("수정 후 저장버튼을 눌러야 작업이 완료됩니다.")
  showToast("수정후 저장 버튼을 눌러주세요.")
  // 자동 저장 함수 호출
  startAutoSave();
}


const onTextAreaInput = (event: Event) => {
  let newText = (event.target as HTMLTextAreaElement).value; 
  if(event instanceof KeyboardEvent) {
      // 엔터 키를 눌렀을 때 '\n' 처리
    if (event.key  === 'Enter') {
      newText += '\n';
    }
  }
  text.value = newText;
}

const handleItemClick = (v: Daily) => {
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
    // alert("내용을 입력해주세요")
    showToast("내용을 입력해주세요")
    dailys.value = savedTexts;
    return
  }

  const index = savedTexts.findIndex((item:SavedText) => item.id === editingItemId.value);
  const currentDate = new Date(); // 현재 시간을 얻기 위해 Date 객체 생성
  const year = currentDate.getFullYear(); // 연도를 가져옴
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // 월을 가져옴 (0부터 시작하므로 +1 필요, 두 자리로 만듦)
  const day = ('0' + currentDate.getDate()).slice(-2); // 일을 가져옴 (두 자리로 만듦)
  const hours = ('0' + currentDate.getHours()).slice(-2); // 시간을 가져옴 (두 자리로 만듦)

  const currentTimeFormatted = `${year}.${month}.${day}.${hours}`; // yyyy.mm.dd.hh 형식으로 변환
  if (editingItemId.value) {
    // 수정 중인 아이템의 인덱스 찾기
    if (index !== -1) {
      // 해당 아이템의 내용을 수정
      savedTexts[index].title = title.value;
      savedTexts[index].text = text.value;
      savedTexts[index].date = currentTimeFormatted
      localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
      console.log(`Item with ID ${editingItemId.value} updated`);
    } else {
      console.log(`Item with ID ${editingItemId.value} not found`);
    }
  } else {
    const id = generateId(); // 고유한 id 생성
    savedTexts.push({ id: id, title: title.value, text: text.value, date: currentTimeFormatted }); // 새로운 텍스트 추가
    localStorage.setItem('savedTexts', JSON.stringify(savedTexts)); // 배열을 다시 local storage에 저장
    console.log(`New item added with ID ${id}`);
  }
    
    // 로컬스토리지 내용 갱신
    localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
    
    // 화면갱신
    dailys.value = savedTexts;
    title.value = "";
    text.value = ""

  // const id = generateId(); // 고유한 id 생성
  // savedTexts.push({ id: id, title: title.value, text: text.value }); // 새로운 텍스트 추가
  // localStorage.setItem('savedTexts', JSON.stringify(savedTexts)); // 배열을 다시 local storage에 저장
  // dailys.value = savedTexts;
  // title.value = "";
  // text.value = ""
  // alert("저장 완료")
  showToast("저장 완료")
  isEditMode.value= false
}

const deleteItem = (id:string) => {
  // 삭제 확인 절차
  const confirmed = window.confirm("정말 삭제하시겠습니까?")

  if(confirmed) {
  // 삭제 절차 시작
  // 로컬 스토리지에서 저장된 데이터 가져오기
  const savedTextsStr = localStorage.getItem('savedTexts');
  let savedTexts = savedTextsStr ? JSON.parse(savedTextsStr) : [];

  // 해당 아이템의 인덱스 찾기
  const index = savedTexts.findIndex((item:SavedText) => item.id === id);

  if (index !== -1) {
    // alert('삭제 완료.')
    // 아이템 삭제
    savedTexts.splice(index, 1);
    // 수정된 데이터 다시 로컬 스토리지에 저장
    localStorage.setItem('savedTexts', JSON.stringify(savedTexts));
    // 화면에서도 해당 아이템 삭제
    dailys.value.splice(index, 1);
    // isShow.value = false
    showToast("삭제 완료")
    console.log(`Item with ID ${id} deleted`);
  } else {
    console.log(`Item with ID ${id} not found`);
  }
  isShow.value = false;
  } else {
    showToast("삭제가 취소되었습니다.")
  }
}

const generateId = () => {
  // 현재 시간을 이용하여 고유한 id 생성
  return new Date().getTime().toString(36) + Math.random().toString(36).substr(2);
}

const exportToExcel = () => {
  // 저장된 데이터 가져오기
  const savedTexts = JSON.parse(localStorage.getItem('savedTexts') || '[]');

  // 데이터가 존재하는지 확인
  if (savedTexts.length === 0) {
    // alert('내보낼 데이터가 없습니다.');
    showToast("내보낼 데이터가 없습니다.")
    return;
  }

  // UTF-8 BOM 추가
  let csvContent = "\uFEFF"; // BOM 추가
  csvContent += "date,id,Title,Text\n"; // 헤더 추가

  // // Excel 파일로 변환할 데이터
  // let csvContent = "data:text/csv;charset=utf-8,";
  // // 헤더 추가 (제목과 내용)
  // csvContent += "Title,Text\n";

  // 데이터 배열을 순회하며 각 요소를 CSV 형식으로 변환
  savedTexts.forEach((item:SavedText) => {
    const row = `${item.date},${item.id},${item.title},${item.text.replace(/(?:\r\n|\r|\n)/g, ' ')}\n`;
    csvContent += row;
  });

  // CSV 형식의 데이터를 Blob 객체로 생성
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  // 링크 속성 설정
  link.setAttribute("href", url);
  link.setAttribute("download", "exported_data.csv");
  document.body.appendChild(link);

  // 다운로드 링크 클릭
  link.click();

  // 다운로드 완료 후 링크 제거
  document.body.removeChild(link);
}

</script>

<style lang="less" scoped>
.daily {
  color: #efefef;
  margin:0 auto;
  max-width: 1903px;
  width: 90%;
  .title {
    height: 100px;
    line-height: 100px;
    text-align: center;
    padding-top: 0px;
  }
  input[type="text"] {
    background-color:#2f2f2f;
    color: #efefef;
    max-width: 583px;
    width: 100%;
    padding:15px;
    outline : none;
    border: none;
    margin-bottom: 10px;
    border-radius: 5px;
  }
  textarea {
    color: #efefef;
    background-color:#2f2f2f;
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
    position: relative;
    >p{
      overflow: hidden;
      width: 30px;
      padding: 0 5px;
      >img {
        width: 100%;
        border-radius: 5px;
      }
    }
    max-width: 600px; 
    margin: 10px auto; 
    display: flex; 
    justify-content: flex-end;
    .searchArea {
      position: absolute;
      top: 10px;
      left: 100px;
      width: 60%;
    }
  }
  .list {
    overflow:auto;
    max-width: 600px;
    width: 100%;
    height:40vh;
    margin: 0 auto;
    scrollbar-width: thin; /* Firefox */
    &::-webkit-scrollbar {
      display: none; 
      /* Chrome, Safari, Opera*/
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
        margin-bottom: 10px;
      &> .userBtn {
        display: flex;
        position: absolute;
        right: 0;
        top: -10px;
        &>p {
          padding: 0 7px;
          overflow:hidden;
          width: 30px;
          >img {
            width: 100%;
            border-radius: 5px;
          }
        }
      }
    }
   }
  }
}

@media screen and (min-width : 300px) and (max-width : 768px) {
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
    // word-spacing: -7px; /* 단어 간격을 줄임 */
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
    >p {
      overflow: hidden;
      background-color:#242424;
      >img {
        width: 100%;
        border-radius: 5px;
      }
    }
    max-width: 85%; 
    margin: 10px auto; 
    display: flex; 
    justify-content: flex-end;
    .searchArea {
      position: absolute;
      top: 8px;
      left: 40px;
      width: 60%;
    }
  }
  .list {
    overflow:auto;
    max-width: 90%;
    width: 100%;
    height:40vh;
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
        margin-bottom: 10px;
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
