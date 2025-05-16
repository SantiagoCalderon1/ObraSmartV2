import {Button} from './button';

export function Modal() {
    return {
        view: function ({ attrs }) {
            const { idModal, title, addBtnClose } = attrs
            const slots = attrs.slots || {};
            return m("div.modal.fade", { id: idModal, tabindex: "-1", ariaLabelledby: idModal, ariaHidden: "true", }, [
                m("div.modal-dialog.modal-xl.modal-dialog-centered", [
                    m("div.modal-content", [
                        m("div.modal-header", [
                            m("h1.modal-title.fs-5", { id: "ModalGeneral", style: { fontWeight: "bold" } }, title),
                            m("button.btn-close", { "data-bs-dismiss": "modal", arialLabel: "close", }),
                        ]),
                        slots.header && m("div.modal-header.d-flex.justify-content-center.gap-5", slots.header),
                        m("div.modal-body.d-flex.justify-content-center", slots.body ? slots.body : "Cargando detalles..."),
                        m("div.modal-footer.d-flex", { class: slots.footer ? "justify-content-between" : "justify-content-end" }, [
                            slots.footer && slots.footer,
                            addBtnClose && m("button.btn.btn-outline-secondary rounded-pill fw-bold py-2", { "data-bs-dismiss": "modal" }, "Cerrar"),
                        ]),
                    ]),
                ]),
            ])
        },
    }

}

export function ModalConfirmation() {
    return {
        view: function ({ attrs }) {
            const { idModal, tituloModal, mensaje, actions } = attrs

            const ContentFooterModal = () =>
                m("div", { class: "col-12 d-flex justify-content-center" }, [
                    m("div", { class: "col-8 col-md-4 d-flex justify-content-between gap-5" }, [
                        m(Button, {
                            closeModal: true,
                            bclass: "btn btn-danger ",
                        }, ["Cancelar"]),
                        m(Button, {
                            closeModal: true,
                            bclass: "btn btn-success ",
                            actions: actions,
                        }, ["aceptar"])
                    ])
                ])
            return m(Modal, {
                idModal: idModal,
                title: tituloModal,
                slots: {
                    body: m("p.text-center", mensaje),
                    footer: ContentFooterModal(),
                }
            })
        }
    }
}
