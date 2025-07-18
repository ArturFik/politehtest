import { useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import Info from "../../components/tooltip";
import Select from "../../components/selector";
import type {
  FormData,
  Publication,
  PublicationStatus,
  PublicationType,
} from "../../../services/types";
import {
  selector_api,
  getPublications,
  createPublication,
  updatePublicationStatus,
} from "../../../services/apiService";
import StringDatePicker from "../../components/datapicker";

export const Home = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [modal, setModal] = useState(false);
  const [logo, setLogo] = useState("logo-black.png");
  const [color, setColor] = useState<string>("#1e1e1e");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [publicationTypes, setPublicationTypes] = useState<PublicationType[]>(
    []
  );
  const [isListVisible, setIsListVisible] = useState(false);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: "",
    title: "",
    isCollectiveAuthors: false,
    authors: "",
    coauthors: [],
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    noStateSecret: false,
    expertNumber: "",
    expertDate: "",
    expertStart: "",
    expertEnd: "",
    createdAt: "",
  });

  const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc" | null>(
    null
  );
  const [statusSortOrder, setStatusSortOrder] = useState<"asc" | "desc" | null>(
    null
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    setLogo(theme === "light" ? "logo-black.png" : "logo-white.png");
    setColor(theme === "light" ? "#1e1e1e" : "#fff");

    const fetchData = async () => {
      try {
        const [types, pubs] = await Promise.all([
          selector_api(),
          getPublications(),
        ]);
        setPublicationTypes(types);
        setPublications(pubs);
        if (types.length > 0) {
          setFormData((prev) => ({ ...prev, type: types[0].name }));
          setSelectedTypes(types.map((type: PublicationType) => type.name));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [theme]);

  const toggleDateSort = () => {
    if (dateSortOrder === null) {
      setDateSortOrder("desc");
    } else {
      setDateSortOrder(dateSortOrder === "asc" ? "desc" : "asc");
    }
    setStatusSortOrder(null);
  };

  const toggleStatusSort = () => {
    if (statusSortOrder === null) {
      setStatusSortOrder("asc");
    } else {
      setStatusSortOrder(statusSortOrder === "asc" ? "desc" : "asc");
    }
    setDateSortOrder(null);
  };

  const toggleTypeSelector = () => {
    setShowTypeSelector((prev) => !prev);
  };

  const handleTypeSelection = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredPublications = useMemo(() => {
    let result = [...publications];

    if (selectedTypes.length > 0) {
      result = result.filter((pub) => selectedTypes.includes(pub.type));
    }

    if (dateSortOrder) {
      result.sort((a, b) => {
        const [dayA, monthA, yearA] = a.createdAt.split(".").map(Number);
        const [dayB, monthB, yearB] = b.createdAt.split(".").map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA).getTime();
        const dateB = new Date(yearB, monthB - 1, dayB).getTime();
        return dateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }
    if (statusSortOrder) {
      const statusOrder: Record<PublicationStatus, number> = {
        pending: 1,
        approved: 2,
        rejected: 3,
      };

      result.sort((a, b) => {
        const aStatus = statusOrder[a.status];
        const bStatus = statusOrder[b.status];
        return statusSortOrder === "asc"
          ? aStatus - bStatus
          : bStatus - aStatus;
      });
    }

    return result;
  }, [publications, dateSortOrder, statusSortOrder, selectedTypes]);

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

  const handleAddCoauthor = () => {
    setFormData((prev) => ({
      ...prev,
      coauthors: [...prev.coauthors, ""],
    }));
  };

  const handleRemoveCoauthor = (index: number) => {
    setFormData((prev) => {
      const newCoauthors = [...prev.coauthors];
      newCoauthors.splice(index, 1);
      return { ...prev, coauthors: newCoauthors };
    });
  };

  const handleCoauthorChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newCoauthors = [...prev.coauthors];
      newCoauthors[index] = value;
      return { ...prev, coauthors: newCoauthors };
    });
  };

  type FormDataKey = keyof FormData;

  const validateForm = () => {
    const requiredFields: FormDataKey[] = [
      "type",
      "title",
      "authors",
      "contactName",
      "contactPhone",
      "contactEmail",
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

  const handleSave = async () => {
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
    try {
      const newPublication = await createPublication(formData);
      setPublications([...publications, newPublication]);
      setModal(false);

      setFormData({
        type: publicationTypes.length > 0 ? publicationTypes[0].name : "",
        title: "",
        isCollectiveAuthors: false,
        authors: "",
        coauthors: [],
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        noStateSecret: false,
        expertNumber: "",
        expertDate: "",
        expertStart: "",
        expertEnd: "",
        createdAt: "",
      });
    } catch (error) {
      console.error("Error saving publication:", error);
    }
  };

  const renderStatus = (status: PublicationStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className={`${styles.status} ${styles.status__pending}`}>
            Ожидает
          </span>
        );
      case "approved":
        return (
          <span className={`${styles.status} ${styles.status__approved}`}>
            Одобрено
          </span>
        );
      case "rejected":
        return (
          <span className={`${styles.status} ${styles.status__rejected}`}>
            Отклонено
          </span>
        );
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

  const changePublicationStatus = async (
    id: string,
    newStatus: PublicationStatus
  ) => {
    try {
      const updatedPub = await updatePublicationStatus(id, newStatus);
      setPublications(
        publications.map((pub) => (pub.id === id ? updatedPub : pub))
      );

      if (selectedPublication && selectedPublication.id === id) {
        setSelectedPublication(updatedPub);
      }
    } catch (error) {
      console.error("Error updating publication status:", error);
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

  const getNextStatus = (
    currentStatus: PublicationStatus
  ): PublicationStatus => {
    switch (currentStatus) {
      case "pending":
        return "approved";
      case "approved":
        return "rejected";
      case "rejected":
        return "pending";
      default:
        return "pending";
    }
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
                    <div
                      className={styles["publications__col--type"]}
                      onClick={toggleTypeSelector}
                      style={{ cursor: "pointer" }}
                    >
                      Тип {showTypeSelector ? "▲" : "▼"}
                      {showTypeSelector && (
                        <div className={styles["publications__type--selector"]}>
                          {publicationTypes.map((type) => (
                            <div
                              key={type.name}
                              className={styles["publications__type--option"]}
                            >
                              <input
                                type="checkbox"
                                id={`type-${type.name}`}
                                checked={selectedTypes.includes(type.name)}
                                onChange={() => handleTypeSelection(type.name)}
                              />
                              <label htmlFor={`type-${type.name}`}>
                                {type.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles["publications__col--title"]}>
                      Название
                    </div>
                    <div
                      className={styles["publications__col--date"]}
                      onClick={toggleDateSort}
                      style={{ cursor: "pointer" }}
                    >
                      Дата{" "}
                      {dateSortOrder === "asc"
                        ? "▲"
                        : dateSortOrder === "desc"
                        ? "▼"
                        : "▼"}
                    </div>
                    <div
                      className={styles["publications__col--status"]}
                      onClick={toggleStatusSort}
                      style={{ cursor: "pointer" }}
                    >
                      Статус{" "}
                      {statusSortOrder === "asc"
                        ? "▲"
                        : statusSortOrder === "desc"
                        ? "▼"
                        : "▼"}
                    </div>
                    <div className={styles["publications__col--coauthors"]}>
                      Авторы
                    </div>
                  </div>
                  {filteredPublications.map((pub: Publication) => (
                    <div
                      key={pub.id}
                      className={styles["publications-row"]}
                      onClick={() => openModal(pub)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openModal(pub)}
                    >
                      <div className={styles["publications__col--type"]}>
                        {publicationTypes.find((t) => t.name === pub.type)
                          ?.name || pub.type}
                      </div>

                      <div className={styles["publications__col--title"]}>
                        {pub.title}
                      </div>

                      <div className={styles["publications__col--date"]}>
                        <span className={styles["publication-item--italic"]}>
                          {pub.createdAt}
                        </span>
                      </div>

                      <div
                        className={styles["publications__col--status"]}
                        onClick={(e) => {
                          e.stopPropagation();
                          const newStatus = getNextStatus(pub.status);
                          changePublicationStatus(pub.id.toString(), newStatus);
                        }}
                      >
                        {renderStatus(pub.status)}
                      </div>

                      <div className={styles["publications__col--coauthors"]}>
                        {pub.authors}
                        <br />
                        <br />
                        {pub.coauthors && (
                          <>
                            <strong>Соавторы:</strong> {pub.coauthors}
                          </>
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
              options={publicationTypes.map((type) => ({
                value: type.name,
                label: type.name,
              }))}
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
              <p className={styles["modal__label"]}>
                <span className={styles["star"]}>*</span>
                <strong>Авторы из Московского Политеха:</strong>
              </p>
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
                placeholder="ФИО автора"
              />
            </div>

            {formData.isCollectiveAuthors && (
              <div className={styles["modal__fullwidth-container"]}>
                <div className={styles["modal__coauthor--header"]}>
                  <p>
                    <strong>Соавторы:</strong>
                  </p>
                  <button
                    type="button"
                    className={styles["modal__coauthor--btn"]}
                    onClick={handleAddCoauthor}
                  >
                    + Добавить соавтора
                  </button>
                </div>

                {formData.coauthors.map((coauthor, index) => (
                  <div className={styles["modal__coauthor--view"]}>
                    <input
                      type="text"
                      value={coauthor}
                      onChange={(e) =>
                        handleCoauthorChange(index, e.target.value)
                      }
                      placeholder="ФИО соавтора"
                    />
                    <p
                      onClick={() => handleRemoveCoauthor(index)}
                      className={styles["modal__coauthor--remove"]}
                    >
                      ×
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className={styles["modal__fullwidth-container"]}>
              <p className={styles["modal__label"]}>
                <span className={styles["star"]}>*</span>
                <strong>Контактное лицо:</strong>
              </p>
              <div className={styles["modal__contact"]}>
                <div className={styles["modal__contact--view"]}>
                  <p>
                    <strong>ФИО:</strong>
                  </p>
                  <input
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
                <div className={styles["modal__contact--view"]}>
                  <p>
                    <strong>Телефон:</strong>
                  </p>
                  <input
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+7(999)123-45-67"
                  />
                </div>
                <div className={styles["modal__contact--view"]}>
                  <p>
                    <strong>Почта:</strong>
                  </p>
                  <input
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="ivanov@mospolytech.ru"
                  />
                </div>
              </div>
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
                <p className={styles["modal__label--expertise"]}>
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
                <p className={styles["modal__label--expertise"]}>
                  <span className={styles["star"]}>*</span>
                  <strong>Дата заключения:</strong>
                </p>
                <StringDatePicker
                  selected={formData.expertDate}
                  onChange={(dateString) =>
                    setFormData({ ...formData, expertDate: dateString })
                  }
                  placeholderText="Выберите дату"
                  className={styles["modal__input"]}
                  required
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div className={styles["modal__expertise--field"]}>
                <p className={styles["modal__label--expertise"]}>
                  <span className={styles["star"]}>*</span>
                  <strong>Начало экспертизы:</strong>
                </p>
                <StringDatePicker
                  selected={formData.expertStart}
                  onChange={(dateString) =>
                    setFormData({ ...formData, expertStart: dateString })
                  }
                  placeholderText="Выберите дату"
                  className={styles["modal__input"]}
                  required
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>

              <div className={styles["modal__expertise--field"]}>
                <p className={styles["modal__label--expertise"]}>
                  <span className={styles["star"]}>*</span>
                  <strong>Окончание экспертизы:</strong>
                </p>
                <StringDatePicker
                  selected={formData.expertEnd}
                  onChange={(dateString) =>
                    setFormData({ ...formData, expertEnd: dateString })
                  }
                  placeholderText="Выберите дату"
                  className={styles["modal__input"]}
                  required
                  showYearDropdown
                  dropdownMode="select"
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
