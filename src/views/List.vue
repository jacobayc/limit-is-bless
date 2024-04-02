<template>
  <div class="dailyList" v-for="(list , idx) in dailys" :key ="idx">
    <h3> {{ list.title }} </h3>
    <div> {{ list.text }} </div>
  </div>
  <div class="back" @click="router.push('/')" style="position: fixed; top:20px; right: 30px; cursor: pointer;">BACK</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router";

onMounted(() => {
  // 로컬 스토리지에서 저장된 텍스트 배열을 가져옴
  getList()
})

const router = useRouter();
const dailys = ref<any[]>([])

const getList = () => {
  const query = router.currentRoute.value.query;
  const savedTexts = JSON.parse(localStorage.getItem('savedTexts') || '[]');
  const filteredText = savedTexts.filter((v: any) => v.id == query.id)
  
  // 가져온 텍스트 배열을 dailys 배열에 할당
  dailys.value = filteredText;
}


</script>

<style lang="less" scoped>
.dailyList {
  color: #efefef;
  &>h3 {
    padding-top:40px;
  }
  &>div {
    height: 100vh;
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
      margin:0 auto;
      border-bottom: 1px dashed #ccc;
      padding: 20px 0;
      position: fixed; top:0; left:0;
    }
    &>div {
      position: fixed; top:60px; left:20px;
      width: 92%;
      padding-top:20px;
      text-align: left;
      margin:0 auto;
      overflow:auto;
      height: 100vh;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
  }
}
</style>