import { assign } from "lodash";
import { AdaptiveElement } from "../../src/action-bar";
import { ResponsibilityManager } from "../../src/utils/resonsibilitymanager";

export default QUnit.module("ResponsibilityManager");

class TestModel extends AdaptiveElement {
  public visibleElementsCount: number = 0;
  public isShrank = false;
  public isGrown = false;
  public canShrinkValue = false;
  public canGrowValue = false;
  showFirstN(count: number) {
    this.visibleElementsCount = count;
  }
  public shrink() {
    this.canShrinkValue = false;
    this.canGrowValue = true;
  }

  public grow() {
    this.canGrowValue = false;
    this.canShrinkValue = true;
  }
}

class SimpleContainer {
  parentElement: any;
  constructor(config: any) {
    (<any>Object).assign(this, config);
    this.parentElement = this;
  }
}

var getItemSizes = () => [5, 5, 5, 5, 5, 5, 5];

QUnit.test("Check on element with box-sizing: content-box", function (assert) {
  var container: any = new SimpleContainer({
    offsetWidth: 30,
    scrollWidth: 30,
  });
  var model = new TestModel();
  var manager = new ResponsibilityManager(<any>container, model, 5);
  manager.getItemSizes = getItemSizes;
  manager.getComputedStyle = () => {
    return {
      boxSizing: "content-box",
    };
  };
  manager.process();
  assert.equal(
    model.visibleElementsCount,
    Number.MAX_VALUE,
    "trying show all items at first"
  );
  container.offsetWidth = 24;
  manager.process();
  assert.equal(
    model.visibleElementsCount,
    3,
    "process method set number of visible items 3"
  );
  container.offsetWidth = 18;
  manager.process();
  assert.equal(
    model.visibleElementsCount,
    2,
    "process method set number of visible items 2"
  );

  container.offsetWidth = 41;
  manager.process();
  assert.equal(
    model.visibleElementsCount,
    Number.MAX_VALUE,
    "process method tries show all items"
  );
});

QUnit.test("Check on element with box-sizing: border-box", function (assert) {
  var container: any = new SimpleContainer({
    offsetWidth: 30,
    scrollWidth: 30,
  });
  var model = new TestModel();
  var manager = new ResponsibilityManager(<any>container, model, 5);
  manager.getItemSizes = getItemSizes;
  manager.getComputedStyle = () => {
    return {
      boxSizing: "border-box",
      paddingLeft: "4px",
      paddingRight: "1px",
    };
  };
  container.offsetWidth = 24;
  manager.process();
  assert.equal(
    model.visibleElementsCount,
    2,
    "process method set number of visible items 3"
  );
  container.offsetWidth = 18;
  manager.process();
  assert.equal(
    model.visibleElementsCount,
    1,
    "process method set number of visible items 2"
  );
});

QUnit.test("Check on model which can shrink and grow", function (assert) {
  var container: any = new SimpleContainer({
    offsetWidth: 30,
    scrollWidth: 30,
  });
  var model = new TestModel();
  model.canGrowValue = true;
  var manager = new ResponsibilityManager(<any>container, model, 5);
  manager.getItemSizes = getItemSizes;
  manager.getComputedStyle = () => {
    return { boxSizing: "content-box" };
  };
  manager.process();
  assert.notOk(model.canGrowValue, "process method grew model at first");
  assert.equal(
    model.visibleElementsCount,
    Number.MAX_VALUE,
    "trying show all items at first"
  );

  container.offsetWidth = 24;
  manager.process();
  assert.notOk(model.canShrinkValue, "process shrank model");
  assert.equal(
    model.visibleElementsCount,
    3,
    "process changed visible items count"
  );
  container.offsetWidth = 18;
  manager.process();
  assert.equal(
    model.visibleElementsCount,
    2,
    "process method set number of visible items 2"
  );

  container.offsetWidth = 41;
  manager.process();
  assert.notOk(model.canGrowValue, "process grew model");
  assert.equal(
    model.visibleElementsCount,
    Number.MAX_VALUE,
    "process method tries show all items"
  );
});

QUnit.test("Check on element with parent's changing width", function (assert) {
  var container: any = { offsetWidth: 30, scrollWidth: 30 };
  var parentElement: any = { offsetWidth: 30, scrollWidth: 30 };
  container.parentElement = parentElement;
  var model = new TestModel();
  model.canGrowValue = true;
  var manager = new ResponsibilityManager(<any>container, model, 5);
  manager.getItemSizes = getItemSizes;
  manager.getComputedStyle = () => {
    return { boxSizing: "content-box" };
  };

  container.offsetWidth = container.parentElement.offsetWidth = 24;

  manager.process();
  assert.ok(model.canGrowValue);
  assert.equal(
    model.visibleElementsCount,
    3,
    "process method set number of visible items 3"
  );

  container.offsetWidth = container.parentElement.offsetWidth = 29;
  manager.process();

  assert.ok(model.canGrowValue, "process can't grew");
  assert.equal(
    model.visibleElementsCount,
    Number.MAX_VALUE,
    "process method tries to show all items"
  );
  container.parentElement.offsetWidth = 36;
  manager.process();

  assert.ok(model.canGrowValue, "process grew container");
});
