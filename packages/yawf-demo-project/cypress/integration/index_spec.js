describe('index route spec', () => {

  it('show / page.', async () => {
    const res = await cy.request('/')
    expect(res.status).to.eq(200)
  })

})
