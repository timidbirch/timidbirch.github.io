import test from 'node:test'
import assert from 'node:assert/strict'
import { BLOG_CATEGORIES, getBlogCategory, postsInCategory } from '../src/lib/blog-categories'

test('four unique sections resolve by canonical names and ids', () => {
  assert.equal(BLOG_CATEGORIES.length, 4)
  assert.equal(new Set(BLOG_CATEGORIES.map((category) => category.id)).size, 4)
  for (const category of BLOG_CATEGORIES) {
    assert.equal(getBlogCategory(category.name).id, category.id)
    assert.equal(getBlogCategory(category.id).id, category.id)
    assert.equal(getBlogCategory(category.nameEn).id, category.id)
  }
})

test('old labels and normalized English aliases remain compatible', () => {
  assert.equal(getBlogCategory('技术探索').id, 'technology')
  assert.equal(getBlogCategory('市场观察').id, 'finance')
  assert.equal(getBlogCategory('产品设计').id, 'product')
  assert.equal(getBlogCategory('随笔').id, 'learning')
  assert.equal(getBlogCategory(' Technology & AI ').id, 'technology')
  assert.equal(getBlogCategory('技术与AI').id, 'technology')
})

test('unrecognized and missing categories have a visible home', () => {
  assert.equal(getBlogCategory('').id, 'learning')
  assert.equal(getBlogCategory('自定义分类').id, 'learning')
})

test('section lists partition all posts without changing date order', () => {
  const posts = ['技术与 AI', '市场观察', '自定义分类', '产品与创业', 'CS'].map((category, index) => ({ id: index, data: { category } }))
  assert.equal(postsInCategory(posts).length, 5)
  assert.deepEqual(
    postsInCategory(posts, 'technology').map((post) => post.id),
    [0, 4]
  )
  assert.equal(
    BLOG_CATEGORIES.reduce((sum, category) => sum + postsInCategory(posts, category.id).length, 0),
    posts.length
  )
  assert.equal(postsInCategory([], 'finance').length, 0)
})
