<template>
  <div class="editor-container">
    <div class="editor-head">
      <div class="collaborative-title">
        <div class="title-badge">Daisy</div>
        <h1 class="title-text">协作编辑</h1>
        <p class="title-description">多人实时协作，高效完成文档编辑</p>
      </div>

      <div class="feature-showcase">
        <div class="feature-card">
          <div class="card-header">
            <h3>版本对比功能</h3>
            <p>直观查看文档变化</p>
          </div>
          <div class="image-compare-container">
            <ImageCompare class="shadow-lg rounded-2xl">
              <template #left>
                <img
                  src="https://s2.loli.net/2025/09/07/D5hwT7Pen4fHF9N.jpg"
                  alt="文档原始版本"
                />
              </template>
              <template #right>
                <img
                  src="https://s2.loli.net/2025/09/12/l2FdLJIuzEH1SX7.jpg"
                  alt="文档编辑后版本"
                />
              </template>
            </ImageCompare>
          </div>
        </div>
      </div>
    </div>

    <div class="action-section">
      <Button label="开始协作" raised />
      <Button label="查看示例" severity="secondary" raised />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.editor-container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.editor-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media screen and (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.collaborative-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .title-badge {
    font-size: 2rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(
      90deg,
      var(--fei-color-primary) 0%,
      var(--fei-color-primary-light-3) 100%
    );
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 12px rgba(var(--fei-color-primary-rgb, 64, 158, 255), 0.2);
  }

  .title-text {
    font-size: 5rem;
    font-weight: 700;
    color: var(--fei-color-text-primary, #303133);
    margin-bottom: 1rem;
    line-height: 1.2;

    @media screen and (max-width: 768px) {
      font-size: 2.2rem;
    }
  }

  .title-description {
    font-size: 1.2rem;
    color: var(--fei-color-text-regular, #606266);
    line-height: 1.6;
    max-width: 90%;
  }
}

.feature-showcase {
  display: flex;
  justify-content: flex-end;

  .feature-card {
    background: white;
    border-radius: 1.5rem;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    max-width: 450px;
    width: 100%;

    .card-header {
      margin-bottom: 1.5rem;

      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--fei-color-text-primary, #303133);
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--fei-color-text-secondary, #909399);
        font-size: 0.95rem;
      }
    }

    .image-compare-container {
      border-radius: 1rem;
      overflow: hidden;
    }
  }
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 1rem;

  button {
    padding: 0.8rem 2rem;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;

    &.primary-action {
      background: var(--fei-color-primary);
      color: white;
      box-shadow: 0 4px 12px rgba(var(--fei-color-primary-rgb, 64, 158, 255), 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(var(--fei-color-primary-rgb, 64, 158, 255), 0.4);
      }
    }

    &.secondary-action {
      background: white;
      color: var(--fei-color-primary);
      border: 1px solid var(--fei-color-primary-light-5);

      &:hover {
        background: var(--fei-color-primary-light-9);
      }
    }
  }
}
</style>
