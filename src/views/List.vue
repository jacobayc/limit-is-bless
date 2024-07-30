<template>
  <div class="dailyList" v-for="(list , idx) in dailys" :key ="idx">
    <h3><span> " {{ list.title }} "</span></h3>
    <div> {{ list.text }} </div>
  </div>
  <div class="back" @click="router.push('/')" style="position: fixed; top:20px; right: 30px; cursor: pointer;">BACK</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router";

interface Daily {
  title: string;
  text: string;
  id: string;
  date: string;
}

onMounted(() => {
  // 로컬 스토리지에서 저장된 텍스트 배열을 가져옴
  getList()
})

const router = useRouter();
const dailys = ref<Daily[]>([])

const getList = () => {
  const query = router.currentRoute.value.query;
  const savedTexts = JSON.parse(localStorage.getItem('savedTexts') || '[]');
  const filteredText = savedTexts.filter((v: Daily) => v.id == query.id)
  
  // 가져온 텍스트 배열을 dailys 배열에 할당
  dailys.value = filteredText;
}


</script>

<style lang="less" scoped>
.dailyList {
  color: #efefef;
  height: 100vh;
  &>h3 {
    padding-top:40px;
  }
  &>div {
    height: 80vh;
    padding: 40px 60px;
    overflow: auto;
    text-align: left;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
}
.back {
  color: #efefef;
}

@media screen and (min-width : 300px) and (max-width : 760px) {
  .dailyList {
    width: 100%;
    &>h3{
      width: 100%;
      min-height: 30px;
      margin:0 auto;
      border-bottom: none;
      padding: 10px 0;
      position: fixed; top:0; left:0;
      &>span {
        text-align: left;
        color:salmon;
        display: block;
        width: 280px;
        line-height:30px;
        padding-left: 30px;
        font-size: 18px;
        white-space: nowrap; /* 텍스트가 넘치는 경우 줄바꿈을 방지합니다. */
        overflow: hidden; /* 넘치는 부분을 숨깁니다. */
        text-overflow: ellipsis; /* 넘치는 부분을 말줄임표로 처리합니다. */
      }
      &::after{
        width: 100%;
        content: "";
        display: block;
        transform:translateY(10px);
        border-bottom: 1px solid #ccc;
      }
    }
    &>div {
      position: fixed; top:60px; left:20px;
      width: 92%;
      padding: 20px 0px 20px 0px;
      text-align: left;
      margin:0 auto;
      overflow:auto;
      height: 90vh;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
  }
  .back {
    font-size: 12px;
    line-height: 12px;
    color: #efefef;
  } 
}
</style>