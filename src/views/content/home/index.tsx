import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import Info from "../../components/tooltip";
import Select from "../../components/selector";

type PublicationStatus = "pending" | "approved" | "rejected";

interface Publication {
  id: number;
  title: string;
  type: "scientific" | "thesis";
  isCollectiveAuthors: boolean;
  authors: string;
  coauthors: string;
  contact: string;
  createdAt: string;
  status: PublicationStatus;
}

interface FormData {
  title: string;
  type: "scientific" | "thesis";
  isCollectiveAuthors: boolean;
  authors: string;
  coauthors: string;
  contact: string;
  noStateSecret: boolean;
  expertNumber: string;
  expertDate: string;
  expertStart: string;
  expertEnd: string;
  createdAt: string;
}

export const Home = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [modal, setModal] = useState(false);
  const [logo, setLogo] = useState("logo-black.png");
  const [color, setColor] = useState<string>("#1e1e1e");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isListVisible, setIsListVisible] = useState(false);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: "scientific",
    title: "",
    isCollectiveAuthors: false,
    authors: "",
    coauthors: "",
    contact: "",
    noStateSecret: false,
    expertNumber: "",
    expertDate: "",
    expertStart: "",
    expertEnd: "",
    createdAt: "",
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    setLogo(theme === "light" ? "logo-black.png" : "logo-white.png");
    setColor(theme === "light" ? "#1e1e1e" : "#fff");

    const savedPublications = localStorage.getItem("publications");
    if (savedPublications) {
      try {
        setPublications(JSON.parse(savedPublications));
      } catch (e) {
        console.error("Ошибка загрузки публикаций:", e);
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  type FormDataKey = keyof FormData;

  const validateForm = () => {
    const requiredFields: FormDataKey[] = [
      "type",
      "title",
      "authors",
      "contact",
      "expertNumber",
      "expertDate",
      "expertStart",
      "expertEnd",
    ];

    return requiredFields.every((field) => {
      const value = formData[field];
      return value !== undefined && value !== null && value !== "";
    });
  };

  const handleSave = () => {
    if (!validateForm()) {
      setError(true);
      setTimeout(() => {
        const errorElement = document.querySelector(
          `.${styles["modal__error"]}`
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 0);

      return;
    }

    setError(false);
    const newPublication: Publication = {
      id: Date.now(),
      ...formData,
      status: "pending",
      createdAt: new Date().toLocaleString("ru-RU", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
    };

    const updatedPublications = [...publications, newPublication];
    setPublications(updatedPublications);
    localStorage.setItem("publications", JSON.stringify(updatedPublications));
    setModal(false);

    setFormData({
      type: "scientific",
      title: "",
      isCollectiveAuthors: false,
      authors: "",
      coauthors: "",
      contact: "",
      noStateSecret: false,
      expertNumber: "",
      expertDate: "",
      expertStart: "",
      expertEnd: "",
      createdAt: "",
    });
  };

  const renderStatus = (status: PublicationStatus) => {
    switch (status) {
      case "pending":
        return <span className={styles["status__pending"]}>Ожидает</span>;
      case "approved":
        return <span className={styles["status__approved"]}>Одобрено</span>;
      case "rejected":
        return <span className={styles["status__rejected"]}>Отклонено</span>;
    }
  };
  const renderStatusModal = (status: PublicationStatus) => {
    switch (status) {
      case "pending":
        return <span>Ожидает</span>;
      case "approved":
        return <span>Одобрено</span>;
      case "rejected":
        return <span>Отклонено</span>;
    }
  };

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);

  const openModal = (pub: Publication) => {
    setSelectedPublication(pub);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className={styles["page"]}>
        <div className={styles["header"]}>
          <div className={styles["header__wrapper"]}>
            <div className={styles["header__view"]}>
              <img src={logo} alt="logo" className={styles["header__logo"]} />
              <p>
                <strong>
                  МОСКОВСКИЙ <br />
                  ПОЛИТЕХ
                </strong>
              </p>
            </div>
            <div className={styles["header__view"]}>
              <button
                className={styles["header__button"]}
                onClick={toggleTheme}
              >
                клик
              </button>
              <p>Переключить тему</p>
            </div>
          </div>
        </div>
        <div className={styles["main"]}>
          <h4>
            <strong>ОТКРЫТОЕ ОПУБЛИКОВАНИЕ</strong>
            <p
              className={styles["main__button"]}
              onClick={() => {
                setModal(true);
              }}
            >
              <span className={styles["main__button--text"]}>
                Добавить публикацию{" "}
              </span>
              +
            </p>
          </h4>
          <hr />
          <div className={styles["main__viewButton"]}>
            <p>Мои заявки</p>
            <p>Экспертиза заявок</p>
            <p>Журнал</p>
          </div>
          <p
            className={styles.toggleText}
            onClick={() => setIsListVisible(!isListVisible)}
          >
            Для того чтобы направить публикацию на экспертизу в комиссию по
            открытому опубликованию необходимо:
            {isListVisible ? <>▲</> : <>▼</>}
          </p>

          <ul
            className={`${styles.toggleText__list} ${
              isListVisible ? styles.toggleText__listVisible : ""
            }`}
          >
            <li>
              Нажать «Добавить публикацию» и заполнить информацию о публикации.
            </li>
            <li>
              Подготовить и подписать служебную записку у всех авторов и
              руководителя структурного подразделения (заведующий кафедрой и
              т.п.).
            </li>
            <li>Подготовить и сшить рукопись публикации.</li>
            <li>
              Передать оригинал подписанной служебной записки и рукописи в отдел
              научной информации (г. Москва, ул. Б. Семеновская, д. 38, Б-407).
            </li>
          </ul>

          <p className={styles["main__info"]}>
            <Info color={color} />
            <strong> Примечание:</strong> если соавторами публикации являются
            сотрудники других организаций (не Московский Политех), то необходимо
            письмо-согласие от организации.
          </p>

          <p>
            По вопросам работы комиссии по открытому опубликованию обращаться в
            отдел научной информации центра управления наукой.
          </p>

          <p>
            <strong>Телефон:</strong> +7 (495) 223-05-23, доб. 1797, 1417.
          </p>
          <p>
            <strong>E-mail:</strong>{" "}
            <a href="mailto:la.grant@mospolytech.ru">la.grant@mospolytech.ru</a>
          </p>
          <p>
            <strong>Адрес:</strong> г. Москва, ул. Б. Семеновская, д. 38, Б-407.
          </p>
          <br />

          <p>Список ваших публикаций на экспертизу:</p>

          <>
            <div className={styles["publications-table"]}>
              <div className={styles["publications-scroll-container"]}>
                <div className={styles["publications-content"]}>
                  <div className={styles["publications-header"]}>
                    <div className={styles["publications__col--type"]}>Тип</div>
                    <div className={styles["publications__col--title"]}>
                      Название
                    </div>
                    <div className={styles["publications__col--date"]}>
                      Дата
                    </div>
                    <div className={styles["publications__col--status"]}>
                      Статус
                    </div>
                    <div className={styles["publications__col--coauthors"]}>
                      Авторы
                    </div>
                  </div>
                  {publications.map((pub: Publication) => (
                    <div
                      key={pub.id}
                      className={styles["publications-row"]}
                      onClick={() => openModal(pub)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openModal(pub)}
                    >
                      <div className={styles["publications__col--type"]}>
                        {pub.type === "scientific"
                          ? "Научная статья"
                          : "Тезисы доклада"}
                      </div>

                      <div className={styles["publications__col--title"]}>
                        {pub.title}
                      </div>

                      <div className={styles["publications__col--date"]}>
                        <span className={styles["publication-item--italic"]}>
                          {pub.createdAt}
                        </span>
                      </div>

                      <div className={styles["publications__col--status"]}>
                        {renderStatus(pub.status)}
                      </div>

                      <div className={styles["publications__col--coauthors"]}>
                        {pub.authors}
                        {pub.coauthors && (
                          <Info
                            color={color}
                            tooltip={`Соавторы: ${pub.coauthors}`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {modalOpen && selectedPublication && (
              <div
                className={styles["modal-overlay"]}
                onClick={closeModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                <div
                  className={styles["modal-content"]}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={styles["modal-close"]}
                    onClick={closeModal}
                    aria-label="Закрыть модальное окно"
                  >
                    &times;
                  </button>

                  <h3 id="modal-title">Подробная информация</h3>

                  <div className={styles["modal-row"]}>
                    <span className={styles["modal-label"]}>Тип:</span>
                    <span>
                      {selectedPublication.type === "scientific"
                        ? "Научная статья"
                        : "Тезисы доклада"}
                    </span>
                  </div>

                  <div className={styles["modal-row"]}>
                    <span className={styles["modal-label"]}>Название:</span>
                    <span className={styles["modal-label--title"]}>
                      {selectedPublication.title}
                    </span>
                  </div>

                  <div className={styles["modal-row"]}>
                    <span className={styles["modal-label"]}>Дата:</span>
                    <span className={styles["publication-item--italic"]}>
                      {selectedPublication.createdAt}
                    </span>
                  </div>

                  <div className={styles["modal-row"]}>
                    <span className={styles["modal-label"]}>Статус:</span>
                    <span>{renderStatusModal(selectedPublication.status)}</span>
                  </div>

                  <div className={styles["modal-row"]}>
                    <span className={styles["modal-label"]}>Авторы:</span>
                    <span>{selectedPublication.authors}</span>
                  </div>

                  {selectedPublication.coauthors && (
                    <div className={styles["modal-row"]}>
                      <span className={styles["modal-label"]}>Соавторы:</span>
                      <span>{selectedPublication.coauthors}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        </div>
      </div>
      {modal && (
        <>
          <div
            className={styles["modal__close"]}
            onClick={() => setModal(false)}
          ></div>

          <div className={styles["modal"]}>
            <div className={styles["modal__add"]}>
              <span className={styles["modal__title"]}>
                Добавление новой публикации
              </span>
              <div
                className={styles["modal__close--btn"]}
                onClick={() => setModal(false)}
              >
                ✖
              </div>
            </div>

            <hr className={styles["modal__separator"]} />

            <p>
              <span className={styles["star"]}>*</span>
              <strong>Тип:</strong>
            </p>
            <Select
              label="Тип:"
              name="type"
              value={formData.type}
              required={true}
              onChange={handleInputChange}
              options={[
                { value: "scientific", label: "Научная статья" },
                {
                  value: "thesis",
                  label: "Тезисы доклада",
                },
              ]}
            />

            <div className={styles["modal__fullwidth-container"]}>
              <p className={styles["modal__label"]}>
                <span className={styles["star"]}>*</span>
                <strong>Название материалов:</strong>
              </p>
              <textarea
                className={styles["modal__textarea--fixed"]}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className={styles["modal__authors"]}>
              <span className={styles["star"]}>*</span>
              <strong>Авторы из Московского Политеха:</strong>
              <span className={styles["modal__authors-checkbox-wrap"]}>
                <input
                  className={styles["modal__checkbox"]}
                  type="checkbox"
                  name="isCollectiveAuthors"
                  checked={formData.isCollectiveAuthors}
                  onChange={handleInputChange}
                />
                коллектив авторов
              </span>
            </div>

            <div className={styles["modal__fullwidth-container"]}>
              <input
                className={styles["modal__input--fullwidth"]}
                type="text"
                name="authors"
                value={formData.authors}
                onChange={handleInputChange}
                placeholder="ФИО авторов через запятую"
              />
            </div>

            <div className={styles["modal__fullwidth-container"]}>
              <p className={styles["modal__label"]}>
                <strong>Соавторы:</strong>{" "}
                <span className={styles["modal__coauthors"]}>
                  (инициалы, фамилия, через запятую)
                </span>
              </p>
              <input
                className={styles["modal__input--fullwidth"]}
                type="text"
                name="coauthors"
                value={formData.coauthors}
                onChange={handleInputChange}
                placeholder="ФИО соавторов из других организаций"
              />
            </div>

            <div className={styles["modal__fullwidth-container"]}>
              <p className={styles["modal__label"]}>
                <span className={styles["star"]}>*</span>
                <strong>Контактное лицо (ФИО, телефон, почта):</strong>
              </p>
              <textarea
                className={styles["modal__textarea--fixed"]}
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="Иванов Иван Иванович, +7(999)123-45-67, ivanov@mospolytech.ru"
              ></textarea>
            </div>

            <hr className={styles["modal__separator"]} />

            <p className={styles["modal__subtitle"]}>
              <strong>ЭКСПЕРТИЗА ПУБЛИКАЦИИ</strong>
            </p>

            <div className={styles["modal__expertise"]}>
              <strong>Результат:</strong>
              <span className={styles["modal__expertise-checkbox-wrap"]}>
                <input
                  className={styles["modal__checkbox"]}
                  type="checkbox"
                  name="noStateSecret"
                  checked={formData.noStateSecret}
                  onChange={handleInputChange}
                />
                материалы не содержат гос. тайну
              </span>
            </div>

            <div className={styles["modal__expertise--details"]}>
              <div className={styles["modal__expertise--field"]}>
                <p className={styles["modal__label"]}>
                  <span className={styles["star"]}>*</span>
                  <strong>Номер заключения:</strong>
                </p>
                <input
                  className={styles["modal__input"]}
                  type="text"
                  name="expertNumber"
                  value={formData.expertNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles["modal__expertise--field"]}>
                <p className={styles["modal__label"]}>
                  <span className={styles["star"]}>*</span>
                  <strong>Дата заключения:</strong>
                </p>
                <input
                  className={styles["modal__input"]}
                  type="text"
                  name="expertDate"
                  value={formData.expertDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles["modal__expertise--field"]}>
                <p className={styles["modal__label"]}>
                  <span className={styles["star"]}>*</span>
                  <strong>Начало экспертизы:</strong>
                </p>
                <input
                  className={styles["modal__input"]}
                  type="text"
                  name="expertStart"
                  value={formData.expertStart}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles["modal__expertise--field"]}>
                <p className={styles["modal__label"]}>
                  <span className={styles["star"]}>*</span>
                  <strong>Окончание экспертизы:</strong>
                </p>
                <input
                  className={styles["modal__input"]}
                  type="text"
                  name="expertEnd"
                  value={formData.expertEnd}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles["modal__actions"]}>
              <p className={styles["modal__save-btn"]} onClick={handleSave}>
                Сохранить
              </p>
            </div>
            {error && (
              <div className={styles["modal__error"]}>
                Заполните все обязательные поля!
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
