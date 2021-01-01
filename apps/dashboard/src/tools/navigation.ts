import * as $ from 'jquery';

export class Navigation {

  public static install() {
    //-- Bind all links to pages --
    $("*[data-page]").each((index: number, element: HTMLElement) => {
      const $container = $(element);
      const pageName = $container.data("page");
      const $link = $container.find("a").on('click', () => {
        Navigation.loadPage(pageName);
      })
    });
  }

  public static loadPage(pageName: string): void {
    //-- Hide all pages --
    $('.page').hide();
    $("*[data-page]").removeClass("active");

    $(`#${pageName}.page`).show();
    $(`*[data-page="${pageName}"]`).addClass("active");
  }

}
