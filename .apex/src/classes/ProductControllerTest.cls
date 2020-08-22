@IsTest
public class ProductControllerTest {
	@IsTest
	static void test_getProductList() {
		ProductController.getProductList('');
	}

	@IsTest
	static void test_getProductDetail() {
		ProductController.getProductList('a003V000001Cvh4QAC');
	}

	@IsTest
	static void test_createNewProduct() {
		Map<String, Object> prod = new Map<String, Object> {
				'Name' => 'Test product',
				'Description' => 'Test desc',
				'Type' => 'Test type',
				'Family' => 'Test family',
				'Image' => 'Test image',
				'Price' => 500
		};

		ProductController.createNewProduct(prod);

	}
}