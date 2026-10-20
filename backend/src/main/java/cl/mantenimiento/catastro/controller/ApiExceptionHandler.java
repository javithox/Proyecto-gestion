package cl.mantenimiento.catastro.controller;

import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.transaction.CannotCreateTransactionException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> manejarEstado(ResponseStatusException ex) {
        int status = ex.getStatusCode().value();
        String message = ex.getReason() == null
            ? "La solicitud no pudo completarse"
            : ex.getReason();
        return response(status, message);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getDefaultMessage() == null ? "Revisa los datos ingresados" : error.getDefaultMessage())
            .distinct()
            .findFirst()
            .orElse("Revisa los datos ingresados");
        return response(HttpStatus.BAD_REQUEST.value(), message);
    }

    @ExceptionHandler({
        BindException.class,
        HttpMessageNotReadableException.class,
        MethodArgumentTypeMismatchException.class,
        MissingServletRequestParameterException.class,
        ConstraintViolationException.class
    })
    public ResponseEntity<Map<String, Object>> manejarSolicitudInvalida(Exception ex) {
        return response(HttpStatus.BAD_REQUEST.value(), "La solicitud contiene datos inválidos o incompletos.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> manejarConflictoDeDatos(DataIntegrityViolationException ex) {
        return response(HttpStatus.CONFLICT.value(), "La operación entra en conflicto con datos existentes o relacionados.");
    }

    @ExceptionHandler({DataAccessResourceFailureException.class, CannotCreateTransactionException.class})
    public ResponseEntity<Map<String, Object>> manejarBaseNoDisponible(Exception ex) {
        log.error("No fue posible acceder a la base de datos", ex);
        return response(HttpStatus.SERVICE_UNAVAILABLE.value(), "No se pudo acceder a la base de datos. Intenta nuevamente.");
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> manejarTipoDeContenido(HttpMediaTypeNotSupportedException ex) {
        return response(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value(), "El formato de contenido enviado no es compatible.");
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> manejarMetodoNoPermitido(HttpRequestMethodNotSupportedException ex) {
        return response(HttpStatus.METHOD_NOT_ALLOWED.value(), "El método HTTP no está permitido para esta operación.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarError(Exception ex) {
        log.error("Error inesperado al procesar una solicitud de la API", ex);
        return response(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Ocurrió un error inesperado. Intenta nuevamente.");
    }

    private ResponseEntity<Map<String, Object>> response(int status, String message) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("timestamp", Instant.now().toString());
        result.put("status", status);
        result.put("message", message);
        return ResponseEntity.status(status).body(result);
    }
}
