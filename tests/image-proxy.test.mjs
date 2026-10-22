import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchInstagramImage } from '../src/lib/instagram-image-proxy.ts'
test('rejects untrusted destinations before fetching', async () => {
  let calls = 0
  const fetcher = async () => { calls++; throw Error('must not fetch') }
  for (const url of ['http://127.0.0.1/?instagram.com','https://127.0.0.1/cdninstagram.com',
    'https://instagram.com.evil.test/image','https://evilinstagram.com/image',
    'https://instagram.com@evil.test/image','https://user@instagram.com/image',
    'http://cdninstagram.com/image','https://cdninstagram.com:8443/image',
    'file:///etc/passwd?instagram.com','not a URL']) {
    await assert.rejects(fetchInstagramImage(url, fetcher), { status: 400 })
  }
  assert.equal(calls, 0)
})
test('preserves signed CDN query and forbids redirects', async () => {
  const source = 'https://static.cdninstagram.com/image.png?sig=a%2Fb%2B%3D'
  const result = await fetchInstagramImage(source, async (url, options) => {
    assert.equal(url.href, source); assert.equal(options.redirect, 'error'); assert.ok(options.signal)
    return new Response(new Uint8Array([1,2,3]), { headers: { 'content-type':'image/png' } })
  })
  assert.equal(result.contentType,'image/png')
  assert.deepEqual([...new Uint8Array(result.body)],[1,2,3])
})
test('rejects HTML, SVG, missing MIME and redirect responses', async () => {
  for (const type of ['text/html','image/svg+xml','application/octet-stream','']) {
    await assert.rejects(fetchInstagramImage('https://cdninstagram.com/image', async () =>
      new Response('payload', {headers:{'content-type':type}})), {status:502})
  }
  await assert.rejects(fetchInstagramImage('https://cdninstagram.com/image', async () =>
    new Response(null,{status:302,headers:{location:'http://127.0.0.1'}})), {status:502})
})
test('caps streamed bytes independent of content-length', async () => {
  await assert.rejects(fetchInstagramImage('https://cdninstagram.com/image', async () =>
    new Response(new Uint8Array(10*1024*1024+1),{headers:{'content-type':'image/jpeg'}})),{status:502})
})
