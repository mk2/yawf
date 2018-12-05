describe('api/message(s) spec', () => {

  it('post message', async () => {
    const res = await cy.request('POST', 'api/message')
    expect(res.status).to.eq(200)
    expect(res.body).to.eq('ok')
  })

})
