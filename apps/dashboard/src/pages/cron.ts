import * as $ from 'jquery';

import { Navigation } from '../tools/navigation';
import { ConfigProxy } from '../tools/configProxy';

function twoDigits(value: number): string {
    const text: string = "00" + value;
    return text.substring(text.length - 2);
}

export function register() {
    Navigation.register('cron', {
        onShow: _onShow
    });
}

async function _onShow(): Promise<void> {
    const $scenariosDiv = $("#cron-scenarios");
    $scenariosDiv.empty();

    const scenarios = await ConfigProxy.getValue("cron");
    if (!scenarios) {
        return;
    }
    let i = 0;
    for (let scenario of scenarios) {
        i++;
        let content = `
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
                <div class="card-body">`;
        for (let task of scenario.tasks) {
            content += `
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
                        <!-- No edition at the moment
                        <div class="col-3 col-sm-1 text-right">
                            <a href="#"><i class="bi bi-pencil"></i></a>
                            <a href="#" class="text-danger"><i class="bi bi-trash"></i></a>
                        </div>
                        -->
                    </div>`;
        }
        content += `
                    <!-- No edition at the moment
                    <div class="row">
                        <div class="col text-right">
                            <a href="#"><i class="bi bi-plus"></i></a>
                        </div>
                    </div>
                    -->
                </div>
            </div> <!-- End of card -->`;
        let $content = $(content);
        //-- Bind callbacks --
        $content.find(`input[type="checkbox"]`).on("change", (evt) => {
            scenario.activated = $(evt.target).is(":checked") ? true : false;
            console.log(scenario.activated);
            ConfigProxy.setValues({
                cron: scenarios
            });
        });
        $scenariosDiv.append($content);
    }
}
