<template>
  <div class="toast">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  message: string;
}>();

</script>

<style scoped>
.toast {
  max-width: 100%;
  min-width: 200px;
  min-height: 30px;
  line-height: 30px;
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 14px;
  z-index: 9000;
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}
</style>
