
describe('vocabularies', function() {
    'use strict';

    beforeEach(window.module('superdesk.apps.publish'));
    beforeEach(window.module('superdesk.apps.vocabularies'));
    beforeEach(window.module('superdesk.apps.authoring'));
    beforeEach(window.module('superdesk.templates-cache'));

    it('can fetch vocabularies', inject(function(api, vocabularies, $q, $rootScope) {
        var fixture = {foo: 'bar'};
        spyOn(api, 'query').and.returnValue($q.when(fixture));
        var result;
        vocabularies.getVocabularies().then(
            function(vocabs) {
                result = vocabs;
            }
        );
        $rootScope.$digest();
        expect(api.query).toHaveBeenCalledWith('vocabularies', {where: {type: 'manageable'}});
        expect(result).toBe(fixture);
        expect(vocabularies.vocabularies).toBe(fixture);
    }));

    describe('config modal', function() {

        describe('model', function() {
            var scope;

            beforeEach(inject(function($rootScope, $controller) {
                scope = $rootScope.$new();
                scope.vocabulary = {items: [
                    {foo: 'flareon', bar: 'beedrill', is_active: true},
                    {bar: 'bellsprout', spam: 'sandslash', is_active: true},
                    {qux: 'quagsire', foo: 'frillish', corge: 'corfish', is_active: true}
                ]};
                $controller('VocabularyEdit', {$scope: scope});
            }));

            it('being detected correctly', function() {
                expect(scope.model).toEqual(
                    {foo: null, bar: null, spam: null, qux: null, corge: null, is_active: null}
                );
            });
        });

        describe('controller', function() {
            var scope;
            var testItem;

            beforeEach(inject(function($rootScope, $controller) {
                scope = $rootScope.$new();
                testItem = {'foo': 'flareon', 'bar': 'beedrill', 'is_active': true};
                scope.vocabulary = {items: [testItem]};
                $controller('VocabularyEdit', {$scope: scope});
            }));

            it('can add items', function() {
                scope.addItem();
                expect(scope.vocabulary.items.length).toBe(2);
                expect(scope.vocabulary.items[0]).toEqual({foo: null, bar: null, is_active: true});
            });

            it('can save vocabulary', inject(function(api, $q, $rootScope, metadata) {
                scope.vocabulary.items[0].foo = 'feraligatr';
                scope.vocabulary.items[0].bar = 'bayleef';
                scope.vocabulary.items[0].is_active = true;

                spyOn(api, 'save').and.returnValue($q.when());
                spyOn(metadata, 'initialize').and.returnValue($q.when());
                scope.save();

                $rootScope.$digest();
                expect(api.save).toHaveBeenCalledWith('vocabularies', {
                    items: [{foo: 'feraligatr', bar: 'bayleef', is_active: true}]
                });
                expect(metadata.initialize).toHaveBeenCalled();
            }));

            it('can validate crop_size vocabulary for minimum value(200)',
                    inject(function(api, $q, $rootScope, metadata) {
                scope.vocabulary._id = 'crop_sizes';
                scope.vocabulary.items[0].name = '4-3';
                scope.vocabulary.items[0].is_active = true;
                scope.vocabulary.items[0].width = 200;  // minimum 200 allowed
                scope.vocabulary.items[0].height = 100; // minimum 200 allowed

                spyOn(api, 'save').and.returnValue($q.when());
                spyOn(metadata, 'initialize').and.returnValue($q.when());
                scope.save();

                $rootScope.$digest();
                expect(scope.errorMessage).toBe('Minimum height and width should be greater than or equal to 200');
                expect(api.save).not.toHaveBeenCalled();
                expect(metadata.initialize).toHaveBeenCalled();
            }));

            it('can cancel editing vocabulary', inject(function(api, $q, $rootScope, metadata) {
                var vocabularyLink = scope.vocabulary;
                scope.vocabulary.items[0].foo = 'furret';
                scope.vocabulary.items[0].bar = 'buizel';

                scope.cancel();
                $rootScope.$digest();

                expect(vocabularyLink).toEqual({
                    items: [{foo: 'flareon', bar: 'beedrill', is_active: true}]
                });
            }));
        });
    });
});