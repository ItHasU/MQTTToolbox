import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { ConfigProxy } from '../tools/configProxy';
import { CronScenario, CronTask } from '@mqtttoolbox/commons';

//$('#cron-task-edit-dialog').modal("show");
var scenarios: CronScenario[] = null;

function twoDigits(value: number): string {
  const text: string = "00" + value;
  return text.substring(text.length - 2);
}

export function register() {
  Navigation.register('cron', {
    onInit: _onInit,
    onShow: _onShow
  });
}

async function _onInit(): Promise<void> {
  _editTaskInit();
}

async function _onShow(): Promise<void> {
  const $scenariosDiv = $("#cron-scenarios");
  $scenariosDiv.empty();

  scenarios = await ConfigProxy.getValue("cron");
  if (!scenarios) {
    return;
  }
  let i = 0;
  for (let scenario of scenarios) {
    i++;
    let $content = $(`
      <div class="card mb-3">
        <div class="card-header bg-dark text-light">
          <div class="custom-control custom-switch">
              <input id="cron-scenario-${i}" class="custom-control-input" type="checkbox" ${scenario.activated ? "checked" : ""}>
              <label class="custom-control-label" for="cron-scenario-${i}">${scenario.name}</label>
          </div>
          <!-- No edition at the moment
          <div class="float-right">
              <a class="text-danger" href="#"><i class="bi bi-trash"></i></a>
          </div>
          -->
        </div>
        <div class="card-body">
        </div>
      </div> <!-- End of card -->`);
    // <!--No edition at the moment
    //   < div class="row" >
    //     <div class="col text-right" >
    //       <a href="#" > <i class="bi bi-plus" > </i></a >
    //         </div>
    //         < /div>
    // -->
    $scenariosDiv.append($content);
    //-- Bind callbacks --
    $content.find(`input[type="checkbox"]`).on("change", (evt) => {
      scenario.activated = $(evt.target).is(":checked") ? true : false;
      console.log(scenario.activated);
      ConfigProxy.setValues({
        cron: scenarios
      });
    });

    for (let task of scenario.tasks) {
      let $taskDiv = $(`
        <div class="row">
          <div class="col-8 col-sm-4">
            <span class="badge ${task.days[0] ? "badge-primary" : "badge-danger"}">M<span class="d-none d-sm-inline">on</span></span>
            <span class="badge ${task.days[1] ? "badge-primary" : "badge-danger"}">T<span class="d-none d-sm-inline">ue</span></span>
            <span class="badge ${task.days[2] ? "badge-primary" : "badge-danger"}">W<span class="d-none d-sm-inline">ed</span></span>
            <span class="badge ${task.days[3] ? "badge-primary" : "badge-danger"}">T<span class="d-none d-sm-inline">hr</span></span>
            <span class="badge ${task.days[4] ? "badge-primary" : "badge-danger"}">F<span class="d-none d-sm-inline">ri</span></span>
            <span class="badge ${task.days[5] ? "badge-primary" : "badge-danger"}">S<span class="d-none d-sm-inline">at</span></span>
            <span class="badge ${task.days[6] ? "badge-primary" : "badge-danger"}">S<span class="d-none d-sm-inline">un</span></span>
          </div>
          <div class="col-4 col-sm-1 text-right text-sm-left">${task.hours}:${twoDigits(task.minutes)}</div>
          <div class="col-12 col-sm-3">
            ${task.topic}
          </div>
          <div class="col-9 col-sm-3">
            ${task.payload}
          </div>
          <div class="col-3 col-sm-1 text-right">
            <a href="javascript: void(0);" data-action="edit"><i class="bi bi-pencil"></i></a>
            <a href="javascript: void(0);" data-action="delete" class="text-danger"><i class="bi bi-trash"></i></a>
          </div>
        </div>`);
      $content.find("div.card-body").append($taskDiv);
      $taskDiv.find("a[data-action='edit']").on("click", () => {
        //-- Edit task --
        _editTask(task);
      });
      $taskDiv.find("a[data-action='delete']").on("click", () => {
        //-- Delete task --
      });
    }
  }
}

//#region Task edit dialog ----------------------------------------------------

var _editedTask: CronTask = null;
var $editTaskDialog: JQuery;

function _editTaskInit(): void {
  $editTaskDialog = $("#cron-task-edit-modal");
  $("#cron-task-save").on("click", async () => {
    // Handle dialog not initialized
    if (!_editedTask) {
      ($editTaskDialog as any).modal("hide");
      return;
    }

    //-- Read content from form --
    // TODO

    //-- Trigger config save --
    await ConfigProxy.setValues({
      cron: scenarios
    });

    //-- Close dialog --
    ($editTaskDialog as any).modal("hide");
    Navigation.refresh();
  });
}

/** Allows to edit a task in a dialog. */
function _editTask(task: CronTask): void {
  _editedTask = task;
  if (!task) {
    return;
  }

  //-- Fill dialog with current task --
  // TODO

  //-- Show dialog --
  ($editTaskDialog as any).modal("show");
}