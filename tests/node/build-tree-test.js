import { expect } from 'chai';
import MergeTree from 'broccoli-merge-trees';
import { createBuildTree } from '../../build-tree';

describe('Build Tree', function () {
  describe('createBuildTree', function () {
    it('return broccoli tree', function () {
      const project = {
        path: './',
        preBundleAddons: [],
        bundleAddons: [],
      };
      expect(createBuildTree(project)).to.be.instanceof(MergeTree);
    });

    context('with addons', function () {
      it('calls #build of every addon', function () {
        let called = false;
        const project = {
          path: '',
          bundleAddons: [],
          preBundleAddons: [
            {
              build() { called = true; },
            },
          ],
        };
        createBuildTree(project);
        expect(called).to.be.true;
      });
    });
  });
});
