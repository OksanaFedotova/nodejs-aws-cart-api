-- Создание типа ENUM для статуса корзины
CREATE TYPE cart_statuses AS ENUM ('OPEN', 'ORDERED');

-- Создание таблицы carts
CREATE TABLE carts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL,
    status cart_statuses NOT NULL
);
CREATE TABLE cart_items (
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    count INTEGER NOT NULL CHECK (count > 0),
    PRIMARY KEY (cart_id, product_id),
    CONSTRAINT fk_cart
        FOREIGN KEY (cart_id) 
        REFERENCES carts (id)
        ON DELETE CASCADE
);

INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES
('c0a6d8b7-6c8f-4e3a-9c23-738b1c074bf3', 'a0e4b53b-92b3-4e1b-a7d8-1dc238b5067e', '2024-07-01', '2024-07-01', 'OPEN'),
('c1e4b53b-92b3-4e1b-a7d8-1dc238b5067e', 'b1e4b53b-92b3-4e1b-a7d8-1dc238b5067e', '2024-07-02', '2024-07-02', 'ORDERED'),
('c2e4b53b-92b3-4e1b-a7d8-1dc238b5067e', 'c1e4b53b-92b3-4e1b-a7d8-1dc238b5067e', '2024-07-03', '2024-07-03', 'OPEN');

INSERT INTO cart_items (cart_id, product_id, count) VALUES
('c0a6d8b7-6c8f-4e3a-9c23-738b1c074bf3', 'b0a6d8b7-6c8f-4e3a-9c23-738b1c074bf3', 2),
('c0a6d8b7-6c8f-4e3a-9c23-738b1c074bf3', 'b1a6d8b7-6c8f-4e3a-9c23-738b1c074bf3', 1),
('c1e4b53b-92b3-4e1b-a7d8-1dc238b5067e', 'b2a6d8b7-6c8f-4e3a-9c23-738b1c074bf3', 4),
('c2e4b53b-92b3-4e1b-a7d8-1dc238b5067e', 'b3a6d8b7-6c8f-4e3a-9c23-738b1c074bf3', 3),
('c2e4b53b-92b3-4e1b-a7d8-1dc238b5067e', 'b4a6d8b7-6c8f-4e3a-9c23-738b1c074bf3', 5);
