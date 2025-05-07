import { connection } from "../server.js";
import jwt from "jsonwebtoken";
import {
  BAD_REQUEST,
  SERVER_ERROR,
  STATUS_OK,
  NOT_FOUND,
  FORBIDDEN,
} from "../Constants/httpStatus.js";
import { uploadImageToCloudinary } from "../Utils/cloudinary.helper.js";

export const getFields = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  connection.query(
    "SELECT * FROM FieldTable WHERE formId = ?",
    [formId],
    (err, results) => {
      if (err) {
        console.error("Error fetching fields:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }
      res.status(STATUS_OK).json(results);
    }
  );
};

export const getCandidateFields = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  connection.query(
    "SELECT status FROM FormTable WHERE formId = ?",
    [formId],
    (formErr, formResults) => {
      if (formErr) {
        console.error("Error checking form status:", formErr);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (formResults.length === 0) {
        return res.status(NOT_FOUND).json({ message: "Form not found" });
      }

      const { status } = formResults[0];
      if (status !== "active") {
        return res.status(FORBIDDEN).json({ message: "Exam not yet started" });
      }

      connection.query(
        "SELECT * FROM FieldTable WHERE formId = ?",
        [formId],
        (fieldErr, fieldResults) => {
          if (fieldErr) {
            console.error("Error fetching fields:", fieldErr);
            return res.status(SERVER_ERROR).json({ error: "Server error" });
          }
          res.status(STATUS_OK).json(fieldResults);
        }
      );
    }
  );
};

export const getForms = (req, res) => {
  connection.query("SELECT * FROM FormTable", (err, results) => {
    if (err) {
      console.error("Error fetching forms:", err);
      return res.status(SERVER_ERROR).json({ error: "Server error" });
    }

    res.status(STATUS_OK).json(results);
  });
};

export const updateField = (req, res) => {
  const { formId, fieldId } = req.params;
  const { label, placeholder, options, rta } = req.body;

  if (!formId || !fieldId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "formId and fieldId are required" });
  }

  if (!label) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Type, label, and placeholder are required" });
  }

  connection.query(
    "UPDATE FieldTable SET label = ?, placeholder = ?, options = ?, rta = ? WHERE formId = ? AND fieldId = ?",
    [
      label,
      placeholder || null,
      JSON.stringify(options),
      JSON.stringify(rta),
      formId,
      fieldId,
    ],
    (err, results) => {
      if (err) {
        console.error("Error updating field:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Field not found" });
      }

      res.status(STATUS_OK).json({ message: "Field updated successfully" });
    }
  );
};

export const deleteField = (req, res) => {
  const { formId, fieldId } = req.params;

  if (!formId || !fieldId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "formId and fieldId are required" });
  }

  connection.query(
    "DELETE FROM FieldTable WHERE formId = ? AND fieldId = ?",
    [formId, fieldId],
    (err, results) => {
      if (err) {
        console.error("Error deleting field:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Field not found" });
      }

      res.status(STATUS_OK).json({ message: "Field deleted successfully" });
    }
  );
};

export const addField = (req, res) => {
  const { formId } = req.params;
  const { fieldId, type, label, placeholder, options, rta } = req.body;

  if (!formId || !type || !label) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Required fields are missing" });
  }

  const query = `
      INSERT INTO FieldTable (fieldId, formId, type, label, placeholder, options, rta)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  connection.query(
    query,
    [
      fieldId,
      formId,
      type,
      label,
      placeholder || null,
      JSON.stringify(options || {}),
      JSON.stringify(rta || {}),
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting field:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      res
        .status(STATUS_OK)
        .json({ message: "Field added successfully", fieldId });
    }
  );
};

export const getFormById = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  connection.query(
    "SELECT * FROM FormTable WHERE formId = ?",
    [formId],
    (err, results) => {
      if (err) {
        console.error("Error fetching form:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.length === 0) {
        return res.status(NOT_FOUND).json({ message: "Form not found" });
      }

      res.status(STATUS_OK).json(results[0]);
    }
  );
};

export const createForm = (req, res) => {
  const {
    formId,
    label,
    description,
    manager,
    startContent,
    endContent,
    duration,
    status,
  } = req.body;

  if (!label || !duration || !manager) {
    return res.status(BAD_REQUEST).json({ message: "Missing required fields" });
  }

  connection.query(
    `INSERT INTO FormTable (formId, label, description, startContent, endContent, duration, manager, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      formId,
      label || null,
      description,
      startContent || null,
      endContent || null,
      duration,
      manager,
      status,
    ],
    (err, results) => {
      if (err) {
        console.error("Error creating form:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      res
        .status(STATUS_OK)
        .json({ message: "Form created successfully", formId });
    }
  );
};

export const updateForm = (req, res) => {
  const { formId } = req.params;
  const { label, description, startContent, endContent, duration, status } =
    req.body;

  if (!label) {
    return res.status(BAD_REQUEST).json({ message: "Label is required" });
  }

  connection.query(
    `UPDATE FormTable
       SET label = ?, description = ?, startContent = ?, endContent = ?, duration = ?, status = ?
       WHERE formId = ?`,
    [
      label,
      description || null,
      startContent || null,
      endContent || null,
      duration,
      status,
      formId,
    ],
    (err, results) => {
      if (err) {
        console.error("Error updating form:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Form not found" });
      }

      res.status(STATUS_OK).json({ message: "Form updated successfully" });
    }
  );
};

export const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(UNAUTHORIZED);

  jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, user) => {
    if (err) return res.sendStatus(UNAUTHORIZED);

    const newAccessToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.json({ accessToken: newAccessToken });
  });
};

export const deleteForm = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  connection.query(
    `DELETE FROM FormTable WHERE formId = ?`,
    [formId],
    (err, results) => {
      if (err) {
        console.error("Error deleting form:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Form not found" });
      }

      res.status(STATUS_OK).json({ message: "Form deleted successfully" });
    }
  );
};

export const submitForm = (req, res) => {
  const { formId } = req.params;
  const { responseId, ip, userEmail, startTime, termsAccepted } = req.body;

  if (!formId || !responseId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Required fields are missing" });
  }

  const query = `
        INSERT INTO ValueTable (responseId, formId, ip, userEmail, startTime, termsAccepted)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

  connection.query(
    query,
    [responseId, formId, ip, userEmail, startTime, termsAccepted],
    (err, results) => {
      if (err) {
        console.error("Error submitting form response:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      res.status(STATUS_OK).json({ message: "Response submitted", responseId });
    }
  );
};

export const editSubmission = (req, res) => {
  const { formId, responseId } = req.params;
  const {
    value,
    ip,
    userEmail,
    startTime,
    endTime,
    duration,
    termsAccepted,
    score,
    status,
    warnings,
    endIp,
  } = req.body;

  if (!formId || !responseId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "formId and responseId are required" });
  }

    const checkValueTableQuery = `
    SELECT * FROM ValueTable WHERE userEmail = ?
  `;

  connection.query(checkValueTableQuery, [userEmail], (err2, valueResults) => {
    if (err2) {
      console.error("Error checking ValueTable:", err2);
      return res.status(SERVER_ERROR).json({ message: "Server error" });
    }

    if (valueResults.length > 0) {
      return res.status(FORBIDDEN).json({ message: "User already submitted" });
    }

    const query = `
    UPDATE ValueTable
    SET value = ?, ip = ?, userEmail = ?, startTime = ?, endTime = ?, duration = ?, termsAccepted = ?, score = ?, status = ?,
    warnings = ?, endIp = ? WHERE formId = ? AND responseId = ?
  `;

    connection.query(
      query,
      [
        JSON.stringify(value),
        ip,
        userEmail,
        startTime || null,
        endTime || null,
        duration || null,
        termsAccepted,
        score,
        status,
        warnings,
        endIp,
        formId,
        responseId,
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating submission:", err);
          return res.status(SERVER_ERROR).json({ message: "Server error" });
        }

        if (result.affectedRows === 0) {
          return res
            .status(NOT_FOUND)
            .json({ message: "Submission not found" });
        }

        res
          .status(STATUS_OK)
          .json({ message: "Submission updated", responseId });
      }
    );
  });
};

export const getSubmissions = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  connection.query(
    `SELECT * FROM ValueTable WHERE formId = ?`,
    [formId],
    (err, results) => {
      if (err) {
        console.error("Error fetching submissions:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      res.status(STATUS_OK).json(results);
    }
  );
};

export const replaceFields = (req, res) => {
  const { formId } = req.params;
  const fields = req.body.fields;

  if (!formId || !Array.isArray(fields)) {
    return res.status(BAD_REQUEST).json({
      message: "formId and an array of fields are required",
    });
  }

  connection.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(SERVER_ERROR).json({ error: "Server error" });
    }

    connection.query(
      "DELETE FROM FieldTable WHERE formId = ?",
      [formId],
      (deleteErr) => {
        if (deleteErr) {
          return connection.rollback(() => {
            console.error("Delete error:", deleteErr);
            res
              .status(SERVER_ERROR)
              .json({ error: "Server error during delete" });
          });
        }

        const insertQuery = `
            INSERT INTO FieldTable
            (fieldId, formId, type, label, placeholder, options, rta)
            VALUES ?
          `;

        const values = fields.map((field) => [
          field.fieldId,
          formId,
          field.type || null,
          field.label || null,
          field.placeholder || null,
          JSON.stringify(field.options || null),
          JSON.stringify(field.rta || null),
        ]);

        connection.query(insertQuery, [values], (insertErr) => {
          if (insertErr) {
            return connection.rollback(() => {
              console.error("Insert error:", insertErr);
              res
                .status(SERVER_ERROR)
                .json({ error: "Server error during insert" });
            });
          }

          connection.commit((commitErr) => {
            if (commitErr) {
              return connection.rollback(() => {
                console.error("Commit error:", commitErr);
                res
                  .status(SERVER_ERROR)
                  .json({ error: "Server error during commit" });
              });
            }

            res
              .status(STATUS_OK)
              .json({ message: "Fields replaced successfully" });
          });
        });
      }
    );
  });
};

export const uploadImageController = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(BAD_REQUEST).send({ message: "No file uploaded." });
  }

  const imageUrl = await uploadImageToCloudinary(file.buffer);
  res.send({ imageUrl });
};
