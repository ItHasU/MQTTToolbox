import * as $ from 'jquery';

interface PageOptions<T = any> {
  data?: T;
  onInit?: (pageName: string, $page: JQuery, data: T) => Promise<void>;
  onShow?: (pageName: string, $page: JQuery, data: T) => Promise<void>;
  onHide?: (pageName: string, $page: JQuery, data: T) => Promise<void>;
}

interface PageInfo extends PageOptions<any> {
  data: any;
  initialized: boolean;
  displayed: boolean;
}

export class Navigation {
  private static _pageInfos: { [pageName: string]: PageInfo } = {};

  public static install() {
    //-- Bind all links to pages --
    $("a[data-page]").each((index: number, element: HTMLElement) => {
      const $container = $(element);
      const pageName = $container.data("page");
      const $link = $container.on('click', () => {
        Navigation.show(pageName);
      })
    });
  }

  public static async show(pageName: string): Promise<void> {
    //-- Hide all pages --
    $('.page').hide();
    $("*[data-page]").parents(".nav-item").removeClass("active");
    for (let pageNameTmp in Navigation._pageInfos) {
      const infosTmp = Navigation._pageInfos[pageNameTmp];
      if (infosTmp.displayed && infosTmp.onHide) {
        await infosTmp.onHide(pageNameTmp, $(`#${pageNameTmp}.page`), infosTmp.data);
      }
      infosTmp.displayed = false;
    }

    //-- Show page --
    const $page = $(`#${pageName}.page`).show();
    $(`*[data-page="${pageName}"]`).parents(".nav-item").addClass("active");

    const infos = Navigation._getPageInfos(pageName);
    if (!infos.initialized && infos.onInit) {
      await infos.onInit(pageName, $page, infos.data);
    }
    infos.initialized = true;
    infos.displayed = true;
    if (infos.onShow) {
      await infos.onShow(pageName, $page, infos.data);
    }
    $page.scrollTop(0);
  }

  public static async refresh(): Promise<void> {
    for (let page in this._pageInfos) {
      const infos = this._pageInfos[page];
      if (infos.displayed) {
        if (infos.onShow) {
          return this._pageInfos[page].onShow(page, $(`#${page}.page`), infos.data);
        } else {
          return Promise.resolve();
        }
      }
    }
  }

  public static register(pageName: string, options: PageOptions): void {
    const infos = Navigation._getPageInfos(pageName);

    infos.onInit = options.onInit;
    infos.onShow = options.onShow;
    infos.onHide = options.onHide;
  }

  private static _getPageInfos(pageName: string): PageInfo {
    if (!Navigation._pageInfos[pageName]) {
      Navigation._pageInfos[pageName] = {
        data: undefined,
        initialized: false,
        displayed: false
      };
    }

    return Navigation._pageInfos[pageName];
  }

}
