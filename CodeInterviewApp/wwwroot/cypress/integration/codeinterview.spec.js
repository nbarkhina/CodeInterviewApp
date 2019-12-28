/// <reference types="Cypress" />



context('Code Interview App Tests', () => {


    // beforeEach('Login and enter name', () => {
    // })


    it('UX Unit Tests', () => {
        //give it 30 seconds to load because it just published a new version
        cy.visit('https://www.neilb.net/codeinterview/');
        cy.wait(30000);

        cy.get('#txtName').type('John');
        cy.wait(2000);
        cy.get('.btn-primary').eq(2).click();
        cy.wait(2000);

        //test that header contains title
        cy.get('h1').should('contain.text', 'Code Interview App');
        cy.wait(2000);

        //make editor
        cy.get('.form-check-input').click();
        cy.wait(2000);

        //first clear it
        cy.window().then((win) => {
            var result = win.myApp.editor.setValue('');
        });
        cy.wait(2000);

        //set content
        cy.window().then((win) => {
            var result = win.myApp.editor.setValue(
`function Run() 
{ 
    return 'Code Unit Test';
}`
            );
        });
        cy.wait(2000);

        //run code button
        cy.get('.btn-primary').eq(1).click();
        cy.wait(2000);

        //did content show up
        cy.get('#mydiv').should('contain.text','Code Unit Test');
        cy.wait(2000);

        //unit test merger code
        cy.window().then((win) => {
            var result = win.myApp.MergerRef.MergeContent('hello\nneil\nbarkhina\n','hello\nmaddy\nbarkhina\n');
            expect(result).to.equals('hello\nneil\nmaddy\nbarkhina\n\n');
        });
        cy.wait(2000);


    })

    it('Test Mobile Screen',() => {
        cy.viewport('iphone-6');

        //give it 30 seconds to load because it just published a new version
        cy.visit('https://www.neilb.net/codeinterview/');
        cy.wait(5000);

        cy.get('#txtName').type('John iPhone');
        cy.wait(2000);
        cy.get('.btn-primary').eq(2).click();
        cy.wait(2000);

        //on mobile the title gets shortened
        cy.get('h1').should('contain.text','Code Interview');
        cy.get('h1').should('not.contain.text','Code Interview App');
        cy.wait(2000);
        
        
    })

    it('Test Backend',() => {
        //give it 30 seconds to load because it just published a new version
        cy.visit('https://www.neilb.net/codeinterview/');
        cy.wait(5000);

        cy.get('#txtName').type('John Backend');
        cy.wait(2000);
        cy.get('.btn-primary').eq(2).click();
        cy.wait(2000);

        //make editor
        cy.get('.form-check-input').click();
        cy.wait(2000);

        //set content
        cy.window().then((win) => {
            var result = win.myApp.editor.setValue('Unit Testing Backend');
        });
        cy.wait(15000); //give it time to update the backend

        cy.window().then((win) => {
            var result = win.myApp.unitTestGetMonacoContent().then((content)=>{
                console.log('complete',content);
                console.log('complete',content.content);
                expect(content.content).to.equals(`Unit Testing Backend`);
            })
        });
        cy.wait(5000);
        
    })

})
